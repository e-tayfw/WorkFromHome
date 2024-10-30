import { Display } from "@/components/TextStyles";
import { RequestTable } from "@/components/history/table";

const History = () => {
  return (
    <div data-testid="history-component" className="flex flex-col items-start">
      <div className="flex w-full flex-row relative mt-20 lg:mt-0 max-h-[500px]">
        <div className="px-[16px] lg:px-[128px] flex-1">
          <div className="py-[10px] lg:py-[60px] text-[50px] lg:text-[80px] leading-[60px] lg:leading-[95px] font-bold">
            <span className="block animate-slide-up1 mt-[60px] md:mt-[100px]">
              <Display>Manage Your Requests</Display>
            </span>
          </div>
        </div>
      </div>
      <div className="flex-1 w-full max-w-7xl mx-auto md:px-[128px] pt-[60px] pb-[30px] md:pt-[50px] min-h-[70vh]">
        <RequestTable />
      </div>
    </div>
  );
};
export default History;
