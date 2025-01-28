import { singularize, railsAction } from "components/helpers";

const showPage = !!window.location.pathname.match(/^\/(\w+)\/\d+$/)
const resourceType = window.location.pathname.match(/^\/(\w+)/)[1]

const singularResource = showPage || singularize(resourceType) == resourceType
const resourceName = singularResource ? singularize(resourceType) : resourceType
let channelName = (railsAction == "show" || railsAction == "index") ? resourceName : `${railsAction}_${resourceName}`

try {
  await import(`channels/pages/${channelName}_channel`);
} catch (e) {
  // Silently catch error. No channel defined, nothing to load.
}
