module.exports = {
  
  /* jancy_props is an object used to communicate some useful infromation about
  ** your plugin to the Jancy plugin registry.
  **
  ** Required props:
  **    registryVersion (number) - tells Jancy what version of the plugin registry
  **                               this plugin was built against. Currently version
  **                               "1" is supported.
  **
  ** Optional props:
  **    enabled (boolean) - if false, tells Jancy to not enable your plugin by
  **                        default the first time it loads. Default is true.
  **
  */
  jancy_props: {
    registryVersion: 1
  },

  /* --------------------------------------------------------------------------
  ** jancy_onInit is called by the plugin registry when the plugin is loaded.
  **
  ** This is your first opportunity to iteract with Jancy.
  **
  ** Arguments:
  **    jancy (Object)
  **    enabled (boolean) -- is our plugin enabled
  ** ------------------------------------------------------------------------*/
  jancy_onInit(jancy, enabled) {
    if (enabled) {
      this.jancy_onEnabled(jancy)
    }
  },

  /* --------------------------------------------------------------------------
  ** Called by the pluginRegistry when the user has enabled us and we
  ** were previously disabled.
  **
  ** This is a good opportunity to add things to Jancy that your plugin
  ** provides.
  **
  ** Arguments:
  **    jancy (object)
  ** ------------------------------------------------------------------------*/
  jancy_onEnabled(jancy) {

    /* Add a URL handler (a function) that will be called that gets first look at
    ** URLs as tabs try and navigate to them.
    */
    jancy.addURLHandler(urlHandler)
  },

  /* --------------------------------------------------------------------------
  ** Called by the pluginRegistry when the user has disabled us and
  ** we were previously enabled.
  **
  ** This is a good opportunity to remove things from Jancy that your plugin
  ** added.
  **
  ** Arguments:
  **    jancy (object)
  ** ------------------------------------------------------------------------*/
  jancy_onDisabled(jancy) {

    /* Remove our URL handler when the plug-in is disabled.
    */
    jancy.removeURLHandler(urlHandler)
  }
}


/* Custom URL handler that looks URLs formatted like this:
**
** cookie://<cookie-name>:<cookie-value>
**
** it finds a URL that looks like that then:
**
** 1. Attempt to parse the cookie information from the URL.
** 2. Add a cookie to the partition for the domain of the current URL of the tab.
** 3. Reset the URL in the nav bar.
** 4. Tell Jancy it needs to take no further action.
**
** Arguments:
**    jancy (object)
**    tab (object)
**    url (string)
**
** Returns true if we handled the URL and Jancy has to take no further action.
*/
function urlHandler(jancy, tab, url) {

  if (url.startsWith("cookie://")) {

    /* This is a URL we're interested in.
    */
    jancy.console.log(`example-url-handler: got a \"cookie\" URL for ${ url }`)

    /* 1. Strip off the "cookie://" part.
    */
    url = url.slice(9)
    const pos = url.indexOf(':')
    if (pos !== -1) {

      const cookieName = url.slice(0, pos)
      const cookieValue = url.slice(pos+1)

      /* 2. Add a cookie to the partition for the domain of the current URL of the tab.
      */
      const u = new URL(tab.url)
      const partition = jancy.partitions.getPartition(tab.partitionId)
      const newCookie = jancy.partitions.makeCookie({
        name: cookieName,
        value: cookieValue,
        domain: u.hostname
      })

      jancy.partitions.addCookies(partition, [ newCookie ]).then(() => {
        jancy.console.log(`example-url-handler: cookie added!`)
      })

    } else {
      jancy.console.log(`example-url-handler: failed parsing cookie from`)
    }

    /* 3. Reset the URL of the tab.
    */
    jancy.tabManager.updateTab(tab, { url: tab.url }, true)

    /* 4. No further processing of this URL needs to happen.
    */
    return true
  }

  return false
}