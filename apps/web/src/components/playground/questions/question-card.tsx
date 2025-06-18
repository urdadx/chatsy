import { QuestionCardOptions } from "./question-card-options";

export const QuestionCard = ({ props }: { props: any }) => {
  return (
    <div className="w-full transform rotate-0 hover:rotate-1">
      <div className="border-2 border-purple-200 rounded-lg ">
        <div className=" rounded-t-lg px-4 pt-2 flex flex-row items-center justify-between space-y-0">
          <p className="font-medium lowercase text-base text-purple-600">
            {props.question}
          </p>
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
