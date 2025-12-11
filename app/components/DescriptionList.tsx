type ProfileProps = {
  dt: string;
  dd: string;
  capitalize?: boolean;
};

const DescriptionList = ({ dt, dd, capitalize }: ProfileProps) => {
  return (
    <dl>
      <div className="mt-4 flex w-full flex-col">
        <dt className="text-xs uppercase">{dt}</dt>
        <dd
          className={`text-sm font-semibold ${capitalize ? "capitalize" : ""}`}
        >
          {dd}
        </dd>
      </div>
    </dl>
  );
};

export default DescriptionList;
