const Loader = () => {
  return (
    <div className="loader">
      <div className="loader-dots">
        <div className="loader-dot"></div>
        <div className="loader-dot"></div>
        <div className="loader-dot"></div>
      </div>
      <span className="loader-text">AI is thinking...</span>
    </div>
  );
};

export default Loader;
