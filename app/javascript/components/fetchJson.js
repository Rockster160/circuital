export default function fetchJson(url, opts={}) {
  // Ensure headers object exists
  opts.headers = opts.headers || {};

  if (!opts.headers["Content-Type"]) {
    if (opts.body instanceof FormData) {
      opts.headers["Content-Type"] = "multipart/form-data";
    } else {
      opts.headers["Content-Type"] = "application/json";
    }
  }

  if (!opts.headers["Accept"]) {
    if (opts.body instanceof FormData) {
      opts.headers["Accept"] = "multipart/form-data";
    } else {
      opts.headers["Accept"] = "application/json";
    }
  }

  if (opts.headers["Content-Type"] == "application/json") {
    if (typeof opts.body === "object" && !(opts.body instanceof FormData)) {
      opts.body = JSON.stringify(opts.body);
    }
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
  }).catch((err) => {
    // Handle any error (network, parsing, etc.)
    throw new Error(`Fetch error: ${err.message}`);
  });
}
