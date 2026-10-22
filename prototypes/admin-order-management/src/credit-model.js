// Financial demo values, not connected NEW ARK balances. Preserve signed source amounts.
export const credits=[
  {code:"TPVNL00310",company:"GreenTech Installations B.V.",partner:"MPVNL000685",organisation:"Benelux",currency:"EUR",limit:500000,available:321640,overdue:0,days0to7:0,days8to15:0,days16to30:0,days31plus:0,terms:"30 days net",salesRepresentative:"Eva de Vries"},
  {code:"TPVIT00307",company:"Solar Beam SRL",partner:"MPVIT000608",organisation:"Italy",currency:"EUR",limit:180000,available:18820,overdue:24630,days0to7:18000,days8to15:-1500,days16to30:4000,days31plus:4130,terms:"60 days net",salesRepresentative:"Luca Moretti"},
  {code:"TPVFR00306",company:"Énergie Horizon SAS",partner:"MPVFR000688",organisation:"France",currency:"EUR",limit:350000,available:207110,overdue:6420,days0to7:3000,days8to15:1200,days16to30:1000,days31plus:1220,terms:"45 days net",salesRepresentative:"Chloé Bernard"},
  {code:"TPVES00305",company:"IberSun Projects S.L.",partner:"MPVES000683",organisation:"Iberia",currency:"EUR",limit:420000,available:286970,overdue:0,days0to7:5000,days8to15:null,days16to30:null,days31plus:null,terms:"30 days net",salesRepresentative:"Marta Ruiz"},
  {code:"TPVGB00311",company:"Northlight Energy Ltd.",partner:"MPVGB000692",organisation:"UK",currency:"GBP",limit:300000,available:104550,overdue:38740,days0to7:18000,days8to15:9000,days16to30:6000,days31plus:5740,terms:"30 days net",salesRepresentative:"Oliver Taylor"}
];
export const creditStatuses=["Normal","Due soon","Overdue"];
// Proposed Portal indicator, not a NEW ARK status. Overdue wins; missing inputs never mean Normal.
// Finance must confirm that the source 0–7 bucket represents future-due, not already overdue, debt.
export function getCreditStatus(record){
  if(!Number.isFinite(record.overdue))return null;
  if(record.overdue>0)return "Overdue";
  if(!Number.isFinite(record.days0to7))return null;
  return record.days0to7>0?"Due soon":"Normal";
}
export const getCreditValue=(record,key)=>key==="status"?getCreditStatus(record):record[key];
export const creditStatusRule="Portal indicator: Overdue if Overdue > 0; otherwise Due soon if 0–7 Days > 0; otherwise Normal. Missing required data shows —. The source 0–7 bucket meaning requires finance confirmation.";
export const creditFields=[
  ["code","Customer Code"],["company","Company Name"],["partner","Partner Code"],["organisation","Sales Organisation"],["currency","Currency"],
  ["limit","Credit Limit"],["available","Available Amount"],["overdue","Overdue"],["days0to7","0–7 Days"],["days8to15","8–15 Days"],["days16to30","16–30 Days"],["days31plus","31 Days Above"],["terms","Payment Terms"],["status","Credit Status"],["salesRepresentative","Sales representative"]
];
export const creditAmountKeys=new Set(["limit","available","overdue","days0to7","days8to15","days16to30","days31plus"]);
export const formatCreditAmount=(value,currency)=>value==null?"—":new Intl.NumberFormat("en-IE",{style:"currency",currency}).format(value);
export const creditExportHeaders=creditFields.map(([,label])=>label);
export const creditExportRow=credit=>creditFields.map(([key])=>getCreditValue(credit,key)??"");
