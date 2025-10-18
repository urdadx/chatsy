import { Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { Button } from "../ui/button";

export const CTASession = () => {
  return (
    <>
      <section>
        <div className="relative pt-16 md:pt-32">
          <div className="mx-auto max-w-7xl px-6">
            <div className="max-w-3xl  text-center sm:mx-auto lg:mr-auto lg:mt-0 lg:w-4/5">
              <motion.h1
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="mt-8 text-balance text-4xl font-semibold md:text-5xl xl:text-6xl xl:[line-height:1.3] instrument-serif-regular"
              >
                Automate your customer support with{" "}
                <span className="text-purple-600 bg-purple-100 px-1 rounded relative inline-block z-1">
                  AI agents
                </span>
              </motion.h1>

              <motion.p
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, ease: "easeOut", delay: 0.2 }}
                className="mx-auto mt-8 hidden max-w-xl text-wrap text-lg sm:block"
              >
                Instantly answer customer queries with an AI support agent
                trained on your website, docs, faqs and more
              </motion.p>
              <motion.p
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, ease: "easeOut", delay: 0.2 }}
                className="mx-auto mt-6 hidden max-w-xl text-wrap text-lg sm:hidden"
              >
                Instantly answer customer queries with an AI support agent
                trained on your website, docs, faqs and more
              </motion.p>
            </div>
          </div>
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, ease: "easeOut", delay: 0.4 }}
            className="mx-auto w-full max-w-md rounded-xl my-12 flex justify-center"
          >
            <div className="flex flex-row gap-3 items-center justify-center w-full">
              <Link to="/register">
                <Button className="h-10 min-w-[120px]">Get started</Button>
              </Link>
              <a target="_blank" href="https://cal.com/urdadx" rel="noreferrer">
                <Button className="h-10 min-w-[120px]" variant="outline">
                  Book a demo
                </Button>
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
};
