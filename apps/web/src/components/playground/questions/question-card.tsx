import { MessageCircle } from "lucide-react";
import { QuestionCardOptions } from "./question-card-options";

export const QuestionCard = ({ props }: { props: any }) => {
  return (
    <div className="w-full transform rotate-0 hover:rotate-1">
      <div className="border-2 border-purple-200 rounded-lg ">
        <div className=" rounded-t-lg px-4 pt-2 flex flex-row items-center justify-between space-y-0">
          <div className="flex items-center space-x-3">
            <div className="bg-purple-100 p-2 rounded-full">
              <MessageCircle className="w-4 h-4 text-purple-600" />
            </div>
            <p className="font-medium lowercase text-base text-purple-800">
              {props.question}
            </p>
          </div>
          <QuestionCardOptions question={props} />
        </div>
        <div className="p-4 relative">
          <p className="text-gray-800 lowercase text-sm leading-relaxed line-clamp-2">
            {props.answer}
          </p>
        </div>
      </div>
    </div>
  );
};
