const Loading = ({ size = "medium", color = "#4d87fc" }) => {
  const sizeClass = {
    small: "w-4 h-4",
    medium: "w-8 h-8",
    large: "w-12 h-12"
  };

  return (
    <div className="flex justify-center items-center">
      <div
        className={`${sizeClass[size]} border-4 border-t-transparent rounded-full animate-spin`}
        style={{ borderColor: `${color} transparent transparent transparent` }}
      ></div>
    </div>
  );
};

export default Loading;
