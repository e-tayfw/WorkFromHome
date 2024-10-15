import { FC, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/router";
import { FiMenu, FiX } from "react-icons/fi";
import { logout } from '@/redux/slices/authSlice'; // Import the logout action from the authSlice
import { useDispatch } from 'react-redux';
import NextLink from "next/link";
import { NavLink } from "..";
// import { Body } from "@/components/TextStyles";
// import Link from "next/link";

export interface MobileMenuProps {
  scrollPos: number;
  isHomePage: boolean;
}

export const mobileMenuLinks: NavLink[] = [
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

export const MobileMenu: FC<MobileMenuProps> = ({ scrollPos, isHomePage }) => {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [showNumber, setShowNumber] = useState(false);
  const dispatch = useDispatch();

  const containerVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        staggerChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { x: -10, opacity: 0 },
    visible: { x: 0, opacity: 1 },
  };
  function handleSignOut(): void {
    localStorage.removeItem("userType");

    dispatch(logout());
    router.push("/");
  }

  return (
    <>
      <div
        className={`w-[40px] z-100 transition-colors relative ${
          scrollPos > 0.01 || !isHomePage ? "text-black" : "text-white"
        }`}
        onClick={() => router.push("/")}
        role="button"
      ></div>
      <div
        className={`w-6 h-6 cursor-pointer ${
          scrollPos > 0.01 || !isHomePage ? "text-black" : "text-white"
        }`}
        onClick={() => setIsOpen(true)}
      >
        <FiMenu size="100%" />
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-100 flex flex-col items-center bg-white">
          <div className="absolute top-0 right-0 m-4">
            <button className="text-black" onClick={() => setIsOpen(false)}>
              <FiX size="24" />
            </button>
          </div>
          <div className="w-full h-full pt-8">
            <motion.div
              className="flex flex-col relative items-center h-full gap-4"
              initial="hidden"
              animate={isOpen ? "visible" : "hidden"}
              variants={containerVariants}
            >
              {mobileMenuLinks.map((link) => (
                <motion.div
                  key={link.path}
                  className="w-full p-0 pl-6"
                  variants={itemVariants}
                >
                  {link.childPaths ? (
                    <details className="w-full">
                      <summary className="font-bold text-3xl text-black cursor-pointer">
                        {link.title}
                      </summary>
                      <div className="flex flex-col gap-2 pl-4 mt-2">
                        {link.childPaths.map((childPath) => (
                          <motion.div
                            key={childPath.path}
                            variants={itemVariants}
                          >
                            <NextLink
                              href={childPath.path}
                              passHref
                              className="font-semibold text-2xl text-black"
                              onClick={() => setIsOpen(false)}
                            >
                              {childPath.title}
                            </NextLink>
                          </motion.div>
                        ))}
                      </div>
                    </details>
                  ) : (
                    <motion.div variants={itemVariants}>
                      <NextLink
                        href={link.path}
                        passHref
                        className="font-bold text-3xl text-primary"
                        onClick={() => setIsOpen(false)}
                      >
                        {link.title}
                      </NextLink>
                    </motion.div>
                  )}
                </motion.div>
              ))}
              <button onClick={handleSignOut} className="sign-out-button">
                Sign Out
              </button>
            </motion.div>
          </div>
        </div>
      )}
    </>
  );
};
