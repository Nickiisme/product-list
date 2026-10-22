import assert from "node:assert/strict";
import {test,after,before} from "node:test";
import {createServer} from "vite";
import React from "react";
import {renderToStaticMarkup} from "react-dom/server";
import {orders,deliveries,orderProgressOptions,matchesProgress,getOrderArrivals,getOrderDeliveries,documentAvailability,orderExportHeaders,orderExportRow,selectApprovedOrders,deliveryHeaderFields,deliveryItemFields,deliveryExportHeaders,deliveryExportRows} from "../src/order-model.js";
import {credits,creditFields,formatCreditAmount,creditExportHeaders,creditExportRow,getCreditStatus,creditStatuses} from "../src/credit-model.js";

let server,components;
before(async()=>{server=await createServer({server:{middlewareMode:true,ws:false},appType:"custom"});components=await server.ssrLoadModule("/src/App.jsx")});
after(async()=>{await server?.close()});
const render=(Component,props)=>renderToStaticMarkup(React.createElement(Component,props));
const viewProps={rows:orders,query:"",progress:"All",country:"All",dnOpen:null,setQuery(){},setProgress(){},setCountry(){},setSelected(){},setDnOpen(){},notify(){}};

test("eight distinct admin statuses, no partial aggregation",()=>{
  assert.equal(new Set(orderProgressOptions).size,8);
  assert.deepEqual(new Set(orders.map(o=>o.progress)),new Set(orderProgressOptions));
  for(const status of orderProgressOptions){const result=orders.filter(o=>matchesProgress(o,status));assert.equal(result.length,1);assert.equal(result[0].progress,status)}
  assert.equal(orders.filter(o=>matchesProgress(o,"All")).length,8);
});
test("all associated DNs retain their own SAD including unknown and repeated dates",()=>{
  const dates=getOrderArrivals(orders[0]);assert.equal(dates.length,3);
  assert.deepEqual(dates.map(d=>d.sad),["30 Oct, 2026","1 Nov, 2026",null]);
  assert.equal(getOrderArrivals(orders[3]).filter(d=>d.sad==="22 Oct, 2026").length,2);
  for(const order of orders)assert.equal(getOrderDeliveries(order).length,order.dns.length);
});
test("order list has renamed SAD and date columns, two products and Show more, no Columns",()=>{
  const html=render(components.OrderView,viewProps);
  for(const label of ["Order Date","CRD","Scheduled Arrival Time (SAD)","Products","Operation"])assert.ok(html.includes(`<th>${label}</th>`));
  assert.ok(!html.includes(">Columns<"));assert.ok(!html.includes("<th>SSD</th>"));
  assert.equal((html.match(/class="link show-more"/g)||[]).length,orders.filter(o=>o.items.length>2).length);
  const first=html.split('<div class="product-preview">')[1].split("</div>")[0];
  assert.equal((first.match(/<b>/g)||[]).length,2);assert.ok(first.includes("Show more"));assert.ok(!first.includes("SP-PV-CABLE-6"));
  for(const status of orderProgressOptions)assert.ok(html.includes(`<option>${status}</option>`));
});
test("admin details retain business fields without customer-only or source-state UI",()=>{
  const html=render(components.OrderDrawer,{order:{...orders[0],focusItems:true},close(){}});
  for(const text of ["Order overview","Order progress","Items","Commercial details","Total amount","Payment terms","Prepayment / Credit status","Delivery details","Incoterm","Receiving contact","Ship-to address","SKU","Product","Description","Quantity","Unit price","Total","SN &amp; FTD Report","Invoice","Customer code","Partner code","CRD","SSD"])assert.ok(html.includes(text),text);
  for(const item of orders[0].items)assert.ok(html.includes(item.sku));
  assert.ok(html.includes("Show less"));assert.ok(html.includes("Partially complete"));
  assert.ok(html.includes("DN-601866"));assert.ok(html.includes('role="dialog"'));
  for(const removed of ["Contact your sales representative","mailto:","Order status (source)","Allocation Status (source)","Approve Status","System Status"])assert.ok(!html.includes(removed),removed);
  const overview=html.split("<h3>Order overview</h3>")[1].split("<h3>Order progress</h3>")[0];
  const shipping=html.split("<h3>Delivery details</h3>")[1].split("<h3>Deliveries")[0];
  assert.ok(!overview.includes("Scheduled Arrival"));assert.ok(!shipping.includes("Scheduled Arrival"));
  const header=html.split('<div class="drawer-body">')[0];
  assert.ok(header.includes("NEW ARK updated"));assert.ok(header.includes(orders[0].updated));
  assert.equal((html.match(/NEW ARK updated/g)||[]).length,1);
  assert.equal((html.match(/Scheduled Arrival Time \(SAD\)/g)||[]).length,orders[0].dns.length);
  assert.equal((html.match(/<th>Unit price<\/th>/g)||[]).length,1);
  assert.equal((html.match(/Download DN-\d+ SN &amp; FTD Report/g)||[]).length,3);
});
test("only Approved orders enter the sync result; approval does not imply allocation",()=>{
  const records=[{approve:"Approved",so:"yes"},{approve:"Approving"},{approve:"Rejected"},{approve:"Cancelled"},{approve:""},{approve:null},{},{approve:"Unknown"},{approve:"approved"}];
  assert.deepEqual(selectApprovedOrders(records),[records[0]]);
  assert.ok(orders.every(o=>o.approve==="Approved"));
  assert.equal(orders.find(o=>o.progress==="Order created").approve,"Approved");
  assert.ok(deliveries.every(d=>orders.some(o=>o.so===d.so&&o.approve==="Approved")));
});
test("normal detail hides items after five; zero DN state never fabricates delivery",()=>{
  const html=render(components.OrderDrawer,{order:orders[0],close(){}});
  const items=html.split('<h3>Items')[1].split('<h3>Commercial details')[0];
  assert.ok(items.includes("Show 1 more items"));assert.ok(!items.includes(orders[0].items[5].sku));
  const created=render(components.OrderDrawer,{order:orders.find(o=>o.progress==="Order created"),close(){}});
  assert.ok(created.includes("No associated deliveries"));assert.ok(!created.includes('class="delivery-batch'));
});
test("documents are DN scoped and milestones do not infer file readiness",()=>{
  const pending=deliveries.find(d=>!d.shipped);assert.equal(documentAvailability({...pending,sn:true},"sn").ready,false);
  const outbound=deliveries.find(d=>d.shipped&&!d.received);assert.equal(documentAvailability(outbound,"sn").ready,true);assert.equal(documentAvailability({...outbound,invoice:true},"invoice").ready,false);
  const received=deliveries.find(d=>d.received&&!d.invoice);assert.match(documentAvailability(received,"invoice").reason,/file is not available/);
});
test("export preserves all products and DN-date relations, not the two-item summary",()=>{
  for(const order of orders){const row=orderExportRow(order);assert.equal(row.length,orderExportHeaders.length);for(const item of order.items)assert.ok(row[9].includes(item.sku));for(const dn of order.dns)assert.ok(row[7].includes(dn))}
  assert.ok(orderExportRow(orders[0])[7].includes("DN-601866: To be confirmed"));
});
test("delivery drawer is DN scoped and distinct from the order drawer",()=>{
  const d=deliveries[0],html=render(components.DeliveryDrawer,{delivery:d,close(){},onOpenOrder(){}});
  assert.ok(html.includes(`id="delivery-title">${d.dn}</h2>`));
  assert.ok(html.includes("Delivery details · Internal operations"));
  for(const label of ["Creator","Create Time","Shipping Type","Delivery Type","Pickup Date","Pickup Time","Truck No.","Actual Pickup Date","Shipment No.","Consignor Order No.","Warehouse","Contact Person","Contact E-mail","Appointment Date","Appointment Hour","Appointment Booking No.","Ship-to Name","Contact Name","Ship-to Contact Mail","Ship-to Country","Area","Ship-to City","Ship-to Address","Ship-to ZIP"])assert.ok(html.includes(label),label);
  for(const [,label] of deliveryItemFields)assert.ok(html.includes(label),label);
  for(const other of getOrderDeliveries(orders[0]).slice(1))assert.ok(!html.includes(other.dn));
  for(const label of ["Order progress","Commercial details","Total amount","Contact your sales representative"])assert.ok(!html.includes(label),label);
});
test("delivery export expands every line with all header/logistics fields and file states",()=>{
  const result=deliveryExportRows(deliveries);
  assert.equal(result.length,deliveries.reduce((n,d)=>n+Math.max(1,d.items.length),0));
  assert.equal(deliveryExportHeaders.length,deliveryHeaderFields.length+deliveryItemFields.length+3);
  const headers=deliveryExportHeaders;
  for(const d of deliveries){const rows=result.filter(r=>r[headers.indexOf("DN")]===d.dn);assert.equal(rows.length,d.items.length);rows.forEach((r,index)=>{assert.equal(r.length,headers.length);assert.equal(r[headers.indexOf("SKU")],d.items[index].sku);assert.equal(r[headers.indexOf("Creator")],d.creator);assert.equal(r[headers.indexOf("Full Trucks")],d.items[index].fullTrucks??"")})}
  const empty=deliveryExportRows([{...deliveries[0],items:[]}]);assert.equal(empty.length,1);assert.equal(empty[0][headers.indexOf("SKU")],"");
  const sample=result[0];assert.equal(sample[headers.indexOf("Appointment Date")],"31 Oct, 2026");assert.equal(sample[headers.indexOf("Scheduled Arrival Time (SAD)")],"30 Oct, 2026");
});
test("credit overview exposes all ageing fields with separate currency and organisation",()=>{
  const html=render(components.CreditView,{rows:credits,query:"",progress:"All",setQuery(){},setProgress(){},notify(){}});
  for(const [,label] of creditFields)assert.ok(html.includes(`>${label}</th>`),label);
  assert.ok(html.includes('All currencies'));assert.ok(html.includes('All organisations'));assert.ok(!html.includes(">Columns<"));
  assert.ok(html.includes("-€1,500.00"));assert.ok(html.includes("£"));assert.ok(html.includes("—"));
  assert.ok(html.includes("Sales representative"));assert.ok(html.includes("Eva de Vries"));
  assert.ok(!html.includes("View history"));assert.ok(!html.includes("<th>Operation</th>"));
  for(const status of creditStatuses)assert.ok(html.includes(`<option>${status}</option>`));
  for(const removed of ["On hold","Review","Blocked"])assert.ok(!html.includes(removed));
  assert.ok(html.includes("Portal indicator: Overdue"));
});
test("credit export keeps numeric negatives, nulls, zero and currency without recalculating overdue",()=>{
  const italy=credits.find(c=>c.currency==="EUR"&&c.days8to15<0),row=creditExportRow(italy);
  assert.equal(row.length,creditExportHeaders.length);assert.equal(row[creditExportHeaders.indexOf("8–15 Days")],-1500);
  assert.equal(row[creditExportHeaders.indexOf("Overdue")],24630);
  const missing=credits.find(c=>c.days8to15===null);assert.equal(creditExportRow(missing)[creditExportHeaders.indexOf("8–15 Days")],"");
  assert.equal(formatCreditAmount(0,"EUR"),"€0.00");assert.equal(formatCreditAmount(null,"EUR"),"—");
  assert.equal(creditExportRow(credits.at(-1))[creditExportHeaders.indexOf("Currency")],"GBP");
});
test("credit indicator follows threshold priority and fails closed on missing or invalid inputs",()=>{
  for(const [overdue,days0to7,expected] of [[1,2,"Overdue"],[1,null,"Overdue"],[0,2,"Due soon"],[-1,2,"Due soon"],[0,0,"Normal"],[-1,-2,"Normal"],[null,2,null],[undefined,0,null],[0,null,null],[0,NaN,null],[Infinity,1,null],["0",0,null],[0,"5",null]])assert.equal(getCreditStatus({overdue,days0to7}),expected);
  assert.equal(getCreditStatus({overdue:0,days0to7:0,status:"Blocked"}),"Normal");
  assert.deepEqual(new Set(credits.map(getCreditStatus)),new Set(creditStatuses));
});
test("derived credit status and representative agree between list selection and export",()=>{
  for(const status of creditStatuses){const matches=credits.filter(c=>getCreditStatus(c)===status);assert.ok(matches.length);for(const c of matches){const row=creditExportRow(c);assert.equal(row[creditExportHeaders.indexOf("Credit Status")],status);assert.equal(row[creditExportHeaders.indexOf("Sales representative")],c.salesRepresentative)}}
  const unknown=creditExportRow({...credits[0],overdue:null,status:"Normal"});assert.equal(unknown[creditExportHeaders.indexOf("Credit Status")],"");
});
