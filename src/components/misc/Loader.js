import React from "react";
import PropTypes from "prop-types";
import PulseLoader from "react-spinners/PulseLoader";

// Quick component to wrap the loader, will let us swap it out for different styles across other usages

const Loader = (loading) => {
  return <PulseLoader loading={loading} />;
};

Loader.propTypes = {
  loading: PropTypes.bool,
};

export default Loader;
