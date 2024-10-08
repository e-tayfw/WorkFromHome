import { Display } from "@/components/TextStyles";
import { WFHCalendar } from "@/components/schedule/Calendar";
import  { TeamCalendar } from "@/components/schedule/TeamCalendar";
import { useRouter } from "next/router";

const Schedule = () => {
  const router = useRouter();
  const { team } = router.query;

  return (
    <div data-testid="schedule-component" className="flex flex-col items-start">
      <div className="flex flex-row relative mt-20 lg:mt-0 max-h-[500px] ">
        <div className="px-[16px] lg:px-[128px]">
          <div className="py-[10px] lg:py-[60px] text-[50px] lg:text-[80px] leading-[60px] lg:leading-[95px] font-bold ">
            <span className="block animate-slide-up1 mt-[60px] md:mt-[100px]">
              <Display>Lets Get at it!</Display>
            </span>
          </div>
        </div>
      </div>
      <div className="max-w-8xl w-full px-[16px] md:px-[128px] pt-[60px] pb-[30px] md:pt-[50px]">
        {team ? <TeamCalendar /> : <WFHCalendar />}
      </div>
    </div>
  );
};


export default Schedule;