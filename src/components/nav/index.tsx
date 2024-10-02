import { useRouter } from "next/navigation";
import { useRouter as usePagesRouter } from "next/router";
import { useDispatch } from 'react-redux';
import { logout } from '@/redux/slices/authSlice'; // Import the logout action from the authSlice
import { ReactNode, useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { useCheckMobileScreen } from "@/hooks/useIsMobile";
import { MobileMenu } from "@/components/Nav/MobileNav";
import { Body, BodyLarge } from "@/components/TextStyles";
import { motion } from "framer-motion";
export type NavLink = {
  title: string;
  path: string;
  icon?: ReactNode;
  imgUrl?: string;
  clickAction?: () => void;
  childPaths?: NavLink[];
};

export const navLinks: NavLink[] = [
  {
    title: "Schedule",
    path: "/schedule",
    childPaths: [
      {
        title: "My Schedule",
        path: "/schedule",
        imgUrl:
          "https://workfromhomebucket.s3.ap-southeast-2.amazonaws.com/Nav/my-schedule-simu.png",
      },
      {
        title: "Team Schedule",
        path: "/schedule?team=team",
        imgUrl:
          "https://workfromhomebucket.s3.ap-southeast-2.amazonaws.com/Nav/team-schedule-simu.png",
      },
    ],
  },

  {
    title: "Requests",
    path: "/request",
    childPaths: [
      {
        title: "Make a Request",
        path: "/request",
        imgUrl:
          "https://workfromhomebucket.s3.ap-southeast-2.amazonaws.com/Nav/new-request-simu.png",
      },
      {
        title: "Past Requests",
        path: "/request",
        imgUrl:
          "https://workfromhomebucket.s3.ap-southeast-2.amazonaws.com/Nav/view-request-simu.png",
      },
      {
        title: "Approve Requests",
        path: "/request",
        imgUrl:
          "https://workfromhomebucket.s3.ap-southeast-2.amazonaws.com/Nav/approve-request-simu.png",
      },
    ],
  },
];

const Nav = () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const isMobile = useCheckMobileScreen();
  const router = useRouter();
  const pagesRouter = usePagesRouter();

  const [scrollPos, setScrollPos] = useState(0);
  const [hoveredNavItem, setHoveredNavItem] = useState<string>("");
  const [isHomePage, setIsHomePage] = useState(true);

  const [showContent, setShowContent] = useState(false);
  const dispatch = useDispatch();
  
  function handleSignOut(): void {
    localStorage.removeItem("userType");

    dispatch(logout())
    router.push("/");
  }

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (hoveredNavItem) {
      timeout = setTimeout(() => {
        setShowContent(true);
      }, 300);
    } else {
      setShowContent(false);
    }
    return () => {
      clearTimeout(timeout);
    };
  }, [hoveredNavItem]);

  useEffect(() => {
    const path = pagesRouter.pathname;

    if (path === "/") {
      setIsHomePage(true);
    } else {
      setIsHomePage(false);
    }
  }, [pagesRouter.pathname]);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollPos = window.scrollY;
      const maxScroll =
        document.documentElement.scrollHeight - window.innerHeight;
      setScrollPos(Math.min(currentScrollPos / maxScroll, 1));
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleMouseEnterNavItem = (path: string) => {
    if (path === "/schedule" || path === "/request") {
      setHoveredNavItem(path);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const itemVariants = {
    hidden: { y: -20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  const renderDropdownContent = useCallback(() => {
    switch (hoveredNavItem) {
      case "/schedule":
        return (
          <div className="flex w-full justify-center items-center gap-8">
            <motion.div
              key={hoveredNavItem}
              initial="hidden"
              animate={hoveredNavItem === "/schedule" ? "visible" : "hidden"}
              variants={containerVariants}
              className="border-r mr-[50px] border-gray-500 flex flex-row flex-wrap"
            >
              {navLinks[0].childPaths?.map((childPath, index) => (
                <motion.a
                  className="p-2.5 min-w-[100px] flex flex-col items-center"
                  key={index + childPath.title}
                  href={childPath.path}
                  onClick={() => {
                    setShowContent(false);
                    setHoveredNavItem("");
                  }}
                  variants={itemVariants}
                >
                  <div className="w-[300px] h-[162px] rounded-xl overflow-hidden mx-12">
                    <Image
                      src={childPath.imgUrl as string}
                      alt={childPath.title}
                      className="w-full h-full rounded-xl"
                      objectFit="cover"
                      width={400}
                      height={300}
                    />
                  </div>
                  <Body className="font-bold mt-2 text-black">
                    {childPath.title}
                  </Body>
                </motion.a>
              ))}
            </motion.div>
          </div>
        );
      case "/request":
        return (
          <div className="flex w-full justify-center items-center gap-8">
            <motion.div
              key={hoveredNavItem}
              initial="hidden"
              animate={hoveredNavItem === "/request" ? "visible" : "hidden"}
              variants={containerVariants}
              className="border-r mr-[50px] border-gray-500 flex flex-row flex-wrap"
            >
              {navLinks[1].childPaths?.map((childPath, index) => (
                <motion.a
                  className="p-2.5 min-w-[100px] flex flex-col items-center"
                  key={index + childPath.title}
                  href={childPath.path}
                  onClick={() => {
                    setShowContent(false);
                    setHoveredNavItem("");
                  }}
                  variants={itemVariants}
                >
                  <div className="w-[300px] h-[162px] rounded-xl overflow-hidden mx-12">
                    <Image
                      src={childPath.imgUrl as string}
                      alt={childPath.title}
                      className="w-full h-full rounded-xl"
                      objectFit="cover"
                      width={400}
                      height={300}
                    />
                  </div>
                  <Body className="font-bold mt-2 text-black">
                    {childPath.title}
                  </Body>
                </motion.a>
              ))}
            </motion.div>
          </div>
        );
      default:
        return null;
    }
  }, [containerVariants, hoveredNavItem, itemVariants]);

  return (
    <>
      {/* Mobile Nav */}
      <div
        className={`flex md:hidden top-0 z-20 fixed py-6 px-4 justify-between w-full ${
          scrollPos > 0.01 || !isHomePage ? "bg-white" : "bg-transparent"
        } transition-colors duration-500 ease-in-out border-gray-300 ${
          scrollPos > 0.01 || !isHomePage
            ? "border-b border-gray-300"
            : "border-none"
        }`}
      >
        <MobileMenu scrollPos={scrollPos} isHomePage={isHomePage} />
      </div>

      {/* Desktop Nav */}

      <div className="hidden md:flex top-0 z-20 fixed flex-col w-full">
        <div
          className={`w-full flex  py-7 px-8 justify-between ${
            scrollPos > 0.01 || !isHomePage ? "bg-white" : "bg-transparent"
          } transition-colors duration-500 ease-in-out border-gray-300 ${
            scrollPos > 0.01 || !isHomePage
              ? "border-b border-gray-300"
              : "border-none"
          } `}
        >
          <div className="flex relative items-center">
            {navLinks.map((navLink, index) => (
              <div
                key={navLink.title + index}
                onMouseEnter={() => {
                  if (navLink.path !== "/learn") {
                    handleMouseEnterNavItem(navLink.path);
                  } else {
                    setHoveredNavItem("");
                  }
                }}
                className="group relative w-max z-30 px-2"
              >
                <Body
                  className={`font-bold cursor-pointer p-2.5 rounded-lg transition-colors ${
                    hoveredNavItem || scrollPos > 0.01 || !isHomePage
                      ? "text-black"
                      : "text-white"
                  } `}
                >
                  {navLink.title}
                  <span className="absolute -bottom-1 left-1/2 duration-500 transform -translate-x-1/2 w-0 transition-all h-1.5 bg-primary group-hover:w-3/4"></span>
                </Body>
              </div>
            ))}
          </div>
          <div className="flex items-center z-30">
            <button className="sign-out-button" onClick={handleSignOut}>
              <BodyLarge
                className={`font-bold cursor-pointer p-2.5  rounded-lg transition-colors ${
                  hoveredNavItem || scrollPos > 0.01 || !isHomePage
                    ? "text-black"
                    : "text-white"
                } `}
              >
                Sign Out
              </BodyLarge>
            </button>
          </div>

          <div
            className={`absolute z-20 flex w-full bg-white top-0 left-0 origin-top transition-all duration-1000 ${
              hoveredNavItem ? "scale-y-100" : "scale-y-0"
            } hover:scale-y-100`}
            onMouseLeave={() => setHoveredNavItem("")}
          >
            <div className="flex w-full mt-[120px] mb-[24px] min-h-[240px]">
              {showContent && renderDropdownContent()}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Nav;
