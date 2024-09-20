import { Datecomponent } from "@/components/apply/datepicker";
import { Selection } from "@/components/apply/selection";
import { Reason } from "@/components/apply/reason";
import { Submit } from "@/components/apply/submit";
import { Body } from "@/components/TextStyles";

const Apply = () => {
  return (
    <>
        <div >
            <Body className="text-sm font-light text-primary">Select a date</Body>
        </div>
        <div className = "mt-2 ml-2">
            <Datecomponent />
        </div> 
        <div >
            <Body className="mt-8 text-sm font-light text-primary">Preferred Work Arrangement *</Body>
        </div>
        <div className = "mt-2 ml-2">
            <Selection />
        </div>
        <div >
            <Body className="mt-8 text-sm font-light text-primary">Reason</Body>
        </div>
        <div className = "mt-2 ml-2">
            <Reason  />
        </div>
        <div >
            <Body className="mt-4 ml-2 text-xs font-light text-primary">*Your Work-From-Home requests are subjected to approval by your reporting manager</Body>
        </div>
        <div className="mt-4 ml-2">
            <Submit />
        </div>
    </>
  );
}

export {Apply};