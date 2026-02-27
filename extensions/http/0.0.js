/**
 * A simple HTTP extension for PenguinMod.
 * @license lgpl-v3-only
 * @author Steve0Greatness
 * @version 0.0
 */
(function(Scratch){
  const vm = Scratch.vm;

  class Response {
    static get HTTP_STATUS_COLORS() {
      return [
        "#ccf",
        "#cfc",
        "#ffc",
        "#fcc",
        "#fec",
      ];
    }
    #headers;
    #status; #status_text;
    #was_redirected; #url;
    #body; #type; #size;
    constructor(res, blob) {
      this.#headers = new Map(res.headers.entries());
      
      this.#status = res.status;
      this.#status_text = res.statusText;
      
      this.#was_redirected = res.redirected;
      this.#url = res.url

      this.#body = blob;
      this.#type = blob.type;
      this.#size = blob.size;
    }
    getReporterContent() {
      const response_container = document.createElement("div");
      
      const status_container = document.createElement("span");
      const status_group = Math.floor( this.status / 100 );
      const status_color = Response.HTTP_STATUS_COLORS[
        status_group - 1
      ];
      status_container.style.backgroundColor = status_color;
      status_container.innerText = this.status.toString();

      const type_container = document.createElement("span");
      type_container.innerText = xml_escape(this.type)
        + " (" + this.size.toString() + ")";
      
      response_container.append(status_container, type_container);
      return response_container;
    }
  }
  class Requests {
    constructor() {
      if (!vm.jwArray)
        vm.extensionManager.loadExtensionURL("jwArray");
      if (!vm.dogeiscutObject)
        vm.extensionManager.loadExtensionURL(
          "https://extensions.penguinmod.com/extensions/DogeisCut/dogeiscutObject.js"
        );
    }

    async fetch(url, options) {
      const response = await Scratch.fetch(url, options);
      const body = await response.blob();
      return new Response(response, body);
    }

    getInfo() {
      return {
        name: "Requests",
        id: "s0grequests",
        blocks: [
          {
            text: "empty [METHOD] [URL]",
            opcode: "basicrequest",
            blockType: Scratch.BlockType.REPORTER,
            arguments: {
              METHOD: {
                menu: "METHODS",
                defaultValue: "GET"
              }
            }
          }
        ],
        menus: {
          METHODS: {
            acceptReporters: true,
            items: [
              "GET",
              "POST",
              "PUT",
              "DELETE",
              "HEAD",
              "PATCH",
            ]
          }
        }
      }
    }
    
    basicrequest(args) {
      return this.fetch(args.URL, {
        method: args.METHOD
      });
    }
  }

  Scratch.extensions.register(new Requests());

  function xml_escape(unsafe) {
    return unsafe.replace(/[<>&'"]/g, c => (switch (c) {
      case "<": return "&lt;";
      case ">": return "&gt;";
      case "'": return "&apos;";
      case "\"": return "&quot;";
    }))
  }
})(Scratch)
