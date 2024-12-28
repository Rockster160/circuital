export default function fetchJson(url, opts = {}) {
  // Ensure headers object exists
  opts.headers = opts.headers || {};

  // Add JSON content-type headers if not already provided
  if (!opts.headers["Content-Type"]) {
    opts.headers["Content-Type"] = "application/json";
  }
  if (!opts.headers["Accept"]) {
    opts.headers["Accept"] = "application/json";
  }
  if (typeof opts.body === "object") {
    opts.body = JSON.stringify(opts.body);
  }

  return fetch(url, opts).then(async (res) => {
    // Check for HTTP errors
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`HTTP error ${res.status}: ${errorText}`);
    }
    // Parse the JSON, errors here will be caught by the .catch block
    const json = await res.json();
    return json;
    // return { json, res };
  }).catch((err) => {
    // Handle any error (network, parsing, etc.)
    throw new Error(`Fetch error: ${err.message}`);
  });
}
