// Demonstration fixtures only. Production progress and node completion come from NEW ARK.
export const orderStages = ["Order created", "Allocated", "Shipped", "Received", "Invoiced"];
export const orderProgressOptions = ["Order created", "Partially Allocated", "Allocated", "Partially Shipped", "Shipped", "Received", "Partially Invoiced", "Invoiced"];
// NEW ARK DN Status display values. API enum codes must be confirmed by NEW ARK.
export const deliveryStatusOptions = ["Cancelled","Changing","To Be Received","Partially Received","Received","Created","Customer Rejected","SI","Invoiced","Partially Signed","Draft"];
export const matchesDeliveryStatus = (delivery,value) => value === "All" || delivery.progress === value;
export const progressLabel = value => value.startsWith("Partially ") ? `${value.slice(10)} · Partial` : value;
export const matchesProgress = (order, value) => value === "All" || order.progress === value;
// Only the confirmed NEW ARK approval enum admits an order; missing/other values fail closed.
export const selectApprovedOrders = records => records.filter(order=>order.approve === "Approved");
export const selectApprovedDeliveries = (records,parentOrders) => records.filter(d=>d.approve === "Approved" && parentOrders.some(o=>o.so===d.so && o.approve === "Approved"));

const panel = {sku:"GF010100030",product:"SPR-MAX6-450-BLK",description:"Residential photovoltaic module, 450 W",quantity:216,unit:"pcs",unitPrice:134};
const connector = {sku:"GF0700000880",product:"SunPower MC4 connector pair",description:"PV connector pair",quantity:12,unit:"pairs",unitPrice:9};
const cable = {sku:"GF0700000940",product:"SP-PV-CABLE-6",description:"Solar DC cable, 6 mm²",quantity:2,unit:"rolls",unitPrice:95};
const accessory = n => ({sku:`GF070000095${n}`,product:`SP-MOUNT-${n}`,description:`Mounting accessory ${n}`,quantity:4,unit:"pcs",unitPrice:12});
export const money = value => new Intl.NumberFormat("en-IE",{style:"currency",currency:"EUR"}).format(value);
const customers = [
  {customer:"GreenTech Installations B.V.",code:"TPVNL00310",partner:"MPVNL000685",country:"Netherlands",rep:"Eva de Vries",email:"eva.demo@example.com",organisation:"Benelux",terms:"30 days net",address:"Demo receiving site, Rotterdam, Netherlands",contact:"Demo receiving team · +31 20 000 0000"},
  {customer:"Solar Beam SRL",code:"TPVIT00307",partner:"MPVIT000608",country:"Italy",rep:"Luca Moretti",email:"luca.demo@example.com",organisation:"Italy",terms:"60 days net",address:"Demo receiving site, Milano, Italy",contact:"Demo receiving team · +39 02 000 0000"},
  {customer:"Énergie Horizon SAS",code:"TPVFR00306",partner:"MPVFR000688",country:"France",rep:"Chloé Bernard",email:"chloe.demo@example.com",organisation:"France",terms:"45 days net",address:"Demo receiving site, Lyon, France",contact:"Demo receiving team · +33 1 00 00 00 00"},
  {customer:"IberSun Projects S.L.",code:"TPVES00305",partner:"MPVES000683",country:"Spain",rep:"Marta Ruiz",email:"marta.demo@example.com",organisation:"Iberia",terms:"30 days net",address:"Demo receiving site, Valencia, Spain",contact:"Demo receiving team · +34 910 000 000"}
];
const seeds = [
  {so:"SO-260918-1048",customerIndex:0,orderDate:"17 Oct, 2026",crd:"28 Oct, 2026",progress:"Partially Shipped",items:[panel,connector,cable,...[1,2,3].map(accessory)],dns:["DN-601842","DN-601857","DN-601866"],quantities:[216,216,72],sourceStatus:"Partially Shipped",allocation:"Allocated",nodes:["complete","complete","partial","pending","pending"]},
  {so:"SO-260914-0972",customerIndex:1,orderDate:"14 Oct, 2026",crd:"25 Oct, 2026",progress:"Partially Allocated",items:[{...panel,product:"SPR-P7-500-COM",description:"Commercial photovoltaic module, 500 W",quantity:96},connector,cable],dns:["DN-601721"],quantities:[96,72,null],sourceStatus:"Partially Prepare Truck",allocation:"Partially Allocated",nodes:["complete","partial","pending","pending","pending"]},
  {so:"SO-260910-0901",customerIndex:2,orderDate:"10 Oct, 2026",crd:"21 Oct, 2026",progress:"Received",items:[{...panel,product:"SPR-MAX6-440-BLK",description:"Residential photovoltaic module, 440 W",quantity:180}],dns:["DN-601655","DN-601661"],quantities:[180,180,180],sourceStatus:"Customer Signed",allocation:"Allocated",nodes:["complete","complete","complete","complete","pending"]},
  {so:"SO-260907-0844",customerIndex:3,orderDate:"7 Oct, 2026",crd:"19 Oct, 2026",progress:"Invoiced",items:[{...panel,product:"SPR-P7-475-COM",description:"Commercial photovoltaic module, 475 W",quantity:288},connector,cable],dns:["DN-601512","DN-601519","DN-601530"],quantities:[288,288,288],sourceStatus:"Invoiced",allocation:"Allocated",nodes:["complete","complete","complete","complete","complete"]},
  {so:"SO-261006-0801",customerIndex:0,orderDate:"6 Oct, 2026",crd:"29 Oct, 2026",progress:"Order created",items:[panel],dns:[],quantities:[216,null,null],sourceStatus:"Created",allocation:"To Be Allocated",nodes:["complete","pending","pending","pending","pending"]},
  {so:"SO-261005-0792",customerIndex:1,orderDate:"5 Oct, 2026",crd:"26 Oct, 2026",progress:"Allocated",items:[panel,connector],dns:["DN-601700"],quantities:[216,216,null],sourceStatus:"Prepare Truck",allocation:"Allocated",nodes:["complete","complete","pending","pending","pending"]},
  {so:"SO-261004-0783",customerIndex:2,orderDate:"4 Oct, 2026",crd:"22 Oct, 2026",progress:"Shipped",items:[panel],dns:["DN-601640"],quantities:[216,216,216],sourceStatus:"Shipped",allocation:"Allocated",nodes:["complete","complete","complete","pending","pending"]},
  {so:"SO-261003-0774",customerIndex:3,orderDate:"3 Oct, 2026",crd:"20 Oct, 2026",progress:"Partially Invoiced",items:[panel,connector],dns:["DN-601500","DN-601501"],quantities:[216,216,216],sourceStatus:"Partially Invoiced",allocation:"Allocated",nodes:["complete","complete","complete","complete","partial"]}
];
export const orders = selectApprovedOrders(seeds.map(o => ({...customers[o.customerIndex],...o,amount:money(o.items.reduce((sum,item)=>sum+item.quantity*item.unitPrice,0)),qty:o.quantities.map(q=>q??"—").join(" / ")+" pcs",credit:o.customerIndex===1?"On hold":"Released",updated:"20 Oct, 2026 · 14:32",approve:"Approved",system:"SAP Sync Success",incoterm:"DAP",remark:"Demo only — confirm delivery arrangements with the receiving team."})));

const deliverySeeds = [
  {dn:"DN-601842",progress:"To Be Received",warehouse:"NL-Rotterdam DC",carrier:"DHL Freight",pickup:"20 Oct, 2026",ssd:"21 Oct, 2026",sad:"30 Oct, 2026",shipped:true,received:false,sn:true,pod:false,invoice:false},
  {dn:"DN-601857",progress:"Created",warehouse:"NL-Rotterdam DC",carrier:"Kuehne + Nagel",pickup:"24 Oct, 2026",ssd:"24 Oct, 2026",sad:"1 Nov, 2026",shipped:false,received:false,sn:false,pod:false,invoice:false},
  {dn:"DN-601866",progress:"Created",warehouse:"NL-Rotterdam DC",carrier:"Pending assignment",pickup:null,ssd:null,sad:null,shipped:false,received:false,sn:false,pod:false,invoice:false},
  {dn:"DN-601721",progress:"Created",warehouse:"IT-Milano Hub",carrier:"DSV Road",pickup:"23 Oct, 2026",ssd:"24 Oct, 2026",sad:"27 Oct, 2026",shipped:false,received:false,sn:false,pod:false,invoice:false},
  {dn:"DN-601655",progress:"Received",warehouse:"FR-Lyon WH",carrier:"GEODIS",pickup:"17 Oct, 2026",ssd:"18 Oct, 2026",sad:"22 Oct, 2026",shipped:true,received:true,sn:true,pod:true,invoice:false},
  {dn:"DN-601661",progress:"Received",warehouse:"FR-Lyon WH",carrier:"GEODIS",pickup:"18 Oct, 2026",ssd:"19 Oct, 2026",sad:"23 Oct, 2026",shipped:true,received:true,sn:true,pod:true,invoice:false},
  ...["DN-601512","DN-601519","DN-601530"].map((dn,i)=>({dn,progress:"Invoiced",warehouse:"ES-Valencia DC",carrier:"XPO Logistics",pickup:"15 Oct, 2026",ssd:"16 Oct, 2026",sad:i?"22 Oct, 2026":"21 Oct, 2026",shipped:true,received:true,sn:true,pod:true,invoice:true})),
  {dn:"DN-601700",progress:"Created",warehouse:"IT-Milano Hub",carrier:"DSV Road",pickup:"24 Oct, 2026",ssd:"25 Oct, 2026",sad:"28 Oct, 2026",shipped:false,received:false,sn:false,pod:false,invoice:false},
  {dn:"DN-601640",progress:"To Be Received",warehouse:"FR-Lyon WH",carrier:"GEODIS",pickup:"18 Oct, 2026",ssd:"19 Oct, 2026",sad:"24 Oct, 2026",shipped:true,received:false,sn:true,pod:false,invoice:false},
  ...["DN-601500","DN-601501"].map((dn,i)=>({dn,progress:i?"Received":"Invoiced",warehouse:"ES-Valencia DC",carrier:"XPO Logistics",pickup:"15 Oct, 2026",ssd:"16 Oct, 2026",sad:"21 Oct, 2026",shipped:true,received:true,sn:true,pod:true,invoice:!i}))
];
export const deliveries = selectApprovedDeliveries(deliverySeeds.map(d=>({approve:"Approved",...d,so:orders.find(o=>o.dns.includes(d.dn))?.so})),orders).map(d => {
  const o=orders.find(o=>o.dns.includes(d.dn));
  // Explicit demo batches; products/quantities are DN-level, not copied as SO totals.
  const index=o.dns.indexOf(d.dn), split=o.dns.length;
  return {...d,so:o.so,code:o.code,company:o.customer,partner:o.partner,crd:o.crd,
    creator:"demo.operations",createTime:d.dn==="DN-601842"?"18 Oct, 2026 · 09:30:00":null,updated:d.dn==="DN-601842"?"20 Oct, 2026 · 14:30":null,shippingType:"Truck",deliveryType:"TCL Delivery",incoterm:o.incoterm,
    pickupTime:d.dn==="DN-601842"?"09:30:00":null,truckNo:d.dn==="DN-601842"?"TRUCK-DEMO-1842":null,actualPickupDate:d.dn==="DN-601842"?"20 Oct, 2026":null,
    shipmentNo:d.dn==="DN-601842"?"SHIP-DEMO-1842":null,consignorOrderNo:null,warehouseContact:"Demo warehouse team",warehouseEmail:"warehouse.demo@example.com",
    appointmentDate:d.dn==="DN-601842"?"31 Oct, 2026":null,appointmentHour:d.dn==="DN-601842"?"09:00–12:00":null,appointmentBookingNo:d.dn==="DN-601842"?"BOOK-DEMO-1842":null,
    shipToName:o.customer,receivingName:"Demo receiving team",receivingEmail:"receiving.demo@example.com",shipToCountry:o.country,shipToArea:"Demo region",shipToCity:{Netherlands:"Rotterdam",Italy:"Milano",France:"Lyon",Spain:"Valencia"}[o.country],shipToAddress:o.address,shipToZip:null,
    items:o.items.map(item=>({...item,quantity:Math.floor(item.quantity/split)+(index<item.quantity%split?1:0)})).filter(item=>item.quantity>0).map((item,lineIndex)=>({...item,
      lineNo:lineIndex+1,unitSizeCm:lineIndex===0?"199.6 × 113.4 × 3.0":null,grossWeightUnitKg:lineIndex===0?28.9:null,netWeightUnitKg:lineIndex===0?27.5:null,
      totalGrossWeightKg:lineIndex===0?Number((item.quantity*28.9).toFixed(2)):null,totalNetWeightKg:lineIndex===0?Number((item.quantity*27.5).toFixed(2)):null,
      volume:null,totalVolume:null,customsTariff:null,customsDescription:lineIndex===0?"Demo customs description":null,pallets:lineIndex===0?3:null,fullTrucks:null
    }))};
});
export const getOrderDeliveries = order => order.dns.map(dn=>deliveries.find(d=>d.dn===dn)).filter(Boolean);
// Preserve each DN, even when dates repeat; never collapse them to the first arrival.
export const getOrderArrivals = order => getOrderDeliveries(order).map(({dn,sad})=>({dn,sad}));
export function documentAvailability(delivery,type){
  if(!selectApprovedDeliveries([delivery],orders).length)return {ready:false,reason:"Only Approved deliveries belonging to an Approved order are available."};
  const reached=type==="sn"?delivery.shipped:delivery.received;
  if(!reached)return {ready:false,reason:"The required milestone has not been reached yet."};
  if(!delivery[type])return {ready:false,reason:"The file is not available yet. Please try again later."};
  return {ready:true,reason:""};
}
export const orderExportHeaders=["SO","Company Name","Customer Code","Partner Code","Country","Order Date","CRD","Scheduled Arrival Date (SAD)","Order Progress","Products","Ordered / Allocated / Shipped","Delivery Number","Total Amount","Credit","Sales Rep.","Updated"];
export const orderExportRow=o=>[o.so,o.customer,o.code,o.partner,o.country,o.orderDate,o.crd,getOrderArrivals(o).map(d=>`${d.dn}: ${d.sad??"To be confirmed"}`).join(" | ")||"To be confirmed",progressLabel(o.progress),o.items.map(i=>`${i.product} (${i.sku})`).join(" | "),o.qty,o.dns.join(" | "),o.amount,o.credit,o.rep,o.updated];

// A DN has one record in the overview; export is DN × product-line to preserve logistics fields.
export const deliveryHeaderFields=[
  ["code","Customer Code"],["company","Company Name"],["partner","Partner Code"],["so","SO"],["dn","DN"],["progress","Delivery Progress"],
  ["warehouse","Warehouse"],["carrier","Carrier"],["pickup","Pickup Date"],["crd","CRD"],["ssd","SSD"],["sad","Scheduled Arrival Date (SAD)"],
  ["creator","Creator"],["createTime","Create Time"],["shippingType","Shipping Type"],["deliveryType","Delivery Type"],["incoterm","Incoterm"],
  ["pickupTime","Pickup Time"],["truckNo","Truck No."],["actualPickupDate","Actual Pickup Date"],["shipmentNo","Shipment No."],["consignorOrderNo","Consignor Order No."],
  ["warehouseContact","Warehouse Contact Person"],["warehouseEmail","Warehouse Contact E-mail"],
  ["appointmentDate","Appointment Date"],["appointmentHour","Appointment Hour"],["appointmentBookingNo","Appointment Booking No."],["shipToName","Ship-to Name"],
  ["receivingName","Receiving Contact Name"],["receivingEmail","Ship-to Contact Mail"],["shipToCountry","Ship-to Country"],["shipToArea","Ship-to Area"],["shipToCity","Ship-to City"],["shipToAddress","Ship-to Address"],["shipToZip","Ship-to ZIP"],
  ["updated","NEW ARK Updated"]
];
export const deliveryItemFields=[
  ["lineNo","DN Item No."],["sku","SKU"],["product","Product"],["description","Material Description"],["quantity","Quantity"],["unit","Unit"],
  ["unitSizeCm","Unit Size (cm)"],["grossWeightUnitKg","G.W.U. (kg)"],["netWeightUnitKg","N.W.U. (kg)"],["totalGrossWeightKg","Total G.W. (kg)"],["totalNetWeightKg","Total N.W. (kg)"],
  ["volume","Volume"],["totalVolume","Total Volume"],["customsTariff","Customs Tariff"],["customsDescription","Customs Description"],["pallets","Pallets"],["fullTrucks","Full Trucks"]
];
export const deliveryExportHeaders=[...deliveryHeaderFields,...deliveryItemFields].map(([,label])=>label).concat(["POD Available","SN & FTD Available","Invoice Available"]);
export const deliveryExportRows=records=>records.flatMap(d=>(d.items.length?d.items:[{}]).map(item=>[
  ...deliveryHeaderFields.map(([key])=>d[key]??""),...deliveryItemFields.map(([key])=>item[key]??""),...["pod","sn","invoice"].map(type=>documentAvailability(d,type).ready)
]));
