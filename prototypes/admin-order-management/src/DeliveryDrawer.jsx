import {useEffect,useRef} from "react";
import {deliveryItemFields,documentAvailability} from "./order-model.js";

const shippingFields=[["pickup","Pickup Date"],["pickupTime","Pickup Time"],["truckNo","Truck No."],["actualPickupDate","Actual Pickup Date"],["shipmentNo","Shipment No."],["consignorOrderNo","Consignor Order No."],["warehouse","Warehouse"],["warehouseContact","Contact Person"],["warehouseEmail","Contact E-mail"]];
const receivingFields=[["appointmentDate","Appointment Date"],["appointmentHour","Appointment Hour"],["appointmentBookingNo","Appointment Booking No."],["shipToName","Ship-to Name"],["receivingName","Contact Name"],["receivingEmail","Ship-to Contact Mail"],["shipToCountry","Ship-to Country"],["shipToArea","Area"],["shipToCity","Ship-to City"],["shipToAddress","Ship-to Address"],["shipToZip","Ship-to ZIP"]];
const display=value=>value==null||value===""?"—":String(value);
function Fields({record,fields}){return <div className="detail-grid">{fields.map(([key,label])=><div className="info" key={key}><span>{label}</span><b>{display(record[key])}</b></div>)}</div>}
function Section({title,children}){return <section className="detail"><h3>{title}</h3>{children}</section>}

export function DeliveryDrawer({delivery,close,onOpenOrder,notify=()=>{}}){
  const closeButton=useRef(null),dismiss=useRef(close);dismiss.current=close;
  useEffect(()=>{const previous=document.activeElement,overflow=document.body.style.overflow;document.body.style.overflow="hidden";closeButton.current?.focus();const key=e=>{
    if(e.key==="Escape")dismiss.current();
    if(e.key==="Tab"){const nodes=[...document.querySelectorAll('.delivery-drawer button:not(:disabled),.delivery-drawer [tabindex="0"]')];if(e.shiftKey&&document.activeElement===nodes[0]){e.preventDefault();nodes.at(-1)?.focus()}else if(!e.shiftKey&&document.activeElement===nodes.at(-1)){e.preventDefault();nodes[0]?.focus()}}
  };document.addEventListener("keydown",key);return()=>{document.body.style.overflow=overflow;document.removeEventListener("keydown",key);previous?.focus()}},[delivery.dn]);
  return <div className="backdrop" onMouseDown={e=>e.target===e.currentTarget&&close()}><aside className="drawer order-drawer delivery-drawer" role="dialog" aria-modal="true" aria-labelledby="delivery-title">
    <header><div><span>Delivery details · Internal operations</span><h2 id="delivery-title">{delivery.dn}</h2></div><div className="drawer-header-actions"><div className="source-updated"><span>NEW ARK updated</span><b>{display(delivery.updated)}</b></div><button ref={closeButton} onClick={close}>Close</button></div></header>
    <div className="drawer-body">
      <Section title="Delivery overview"><div className="delivery-identity"><div><span>Related SO</span><button className="link strong" onClick={()=>onOpenOrder(delivery.so)}>{delivery.so}</button></div><div><span>Delivery Progress</span><b className="status blue">{delivery.progress}</b></div></div><Fields record={delivery} fields={[["creator","Creator"],["createTime","Create Time"],["code","Customer Code"],["company","Company Name"],["partner","Partner Code"],["shippingType","Shipping Type"],["deliveryType","Delivery Type"],["incoterm","Incoterm"],["carrier","Carrier"],["crd","CRD"],["ssd","SSD"],["sad","Scheduled Arrival Time (SAD)"]]}/></Section>
      <Section title="Delivery files"><div className="document-downloads">{[["pod","POD"],["sn","SN & FTD Report"],["invoice","Invoice"]].map(([type,label])=>{const state=documentAvailability(delivery,type);return <div key={type}><b>{label}</b><span tabIndex={!state.ready?0:undefined} title={state.reason||undefined} className="download-action"><button className="link" disabled={!state.ready} aria-label={`Download ${delivery.dn} ${label}`} onClick={()=>notify(`Demo only — ${label} file API is not connected.`)}>Download</button></span></div>})}</div></Section>
      <Section title="Ship from info"><Fields record={delivery} fields={shippingFields}/></Section>
      <Section title="Ship to info"><Fields record={delivery} fields={receivingFields}/></Section>
      <Section title={`Delivery product & logistics details (${delivery.items.length})`}><p className="demo-note">DN product-line data. Weights are in kg and unit size is in cm. Volume units and Pallets / Full Trucks source definitions require confirmation; missing values are not zero.</p><div className="detail-table-wrap"><table className="detail-table logistics-table"><thead><tr>{deliveryItemFields.map(([key,label])=><th key={key}>{label}</th>)}</tr></thead><tbody>{delivery.items.length?delivery.items.map(item=><tr key={item.lineNo}>{deliveryItemFields.map(([key])=><td key={key}>{display(item[key])}</td>)}</tr>):<tr><td colSpan={deliveryItemFields.length}>No delivery items returned</td></tr>}</tbody></table></div></Section>
      <p className="demo-note">Read-only demo · Only this Delivery Number is shown. NEW ARK and document APIs are not connected.</p>
    </div>
  </aside></div>
}
