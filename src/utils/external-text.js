import yaml from "js-yaml";

export function makeYamlLoader(url) {
  // Returns a function that can be used as the callback argument `loadTexts`
  // to `ExternalTexts.Provider`. It issues an HTTP GET to `url`; treats
  // the result as a YAML file, converting it to a JS object; then calls its
  // argument `setTexts` with the resulting object. Any error thrown during
  // this process is logged to the console (and `setTexts` is not called).
  return function (setTexts) {
    console.log("### YAML loader: loading...");
    fetch(url)
      .then((response) => {
        if (!response.ok) {
          throw new Error(
            `Failed to load YAML: ${response.status} ${response.statusText}`,
          );
        }
        return response.text();
      })
      .then(yaml.safeLoad)
      .then((data) => {
        console.log("### YAML loader: loaded", data);
        return data;
      })
      .then(setTexts)
      .catch((error) => {
        console.error(error);
      });
  };
}
