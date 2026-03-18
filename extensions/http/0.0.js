/**
 * A simple HTTP extension for PenguinMod.
 * @license lgpl-v3-only
 * @author Steve0Greatness
 * @version 0.0
 */
(function(Scratch){

const vm = Scratch.vm;

const TextEncoding = {
  encode: new TextEncoder().encode,
  decode: new TextDecoder().decode,
};

class ResponseType {
  static get HTTP_STATUS_COLORS() {
    return [
      "#ccf",
      "#cfc",
      "#ffc",
      "#fcc",
      "#fec",
    ];
  }
  headers;
  // Headers isn't private because
  // making it private and have a get
  // operator (es. be readonly) would
  // probably cost more than it's worth
  // in memory
  #status; #status_text;
  #was_redirected; #url;
  #body; #type; #size;
  constructor(res, blob) {
    this.headers = new Map(res.headers.entries());
    
    this.#status = res.status;
    this.#status_text = res.statusText;
    
    this.#was_redirected = res.redirected;
    this.#url = res.url

    this.#body = blob;
    this.#type = blob.type;
    this.#size = blob.size;
  }

  bytes() {
    return this.#body.bytes();
  }
  text() {
    return this.#body.text();
  }
  async base64() {
    return (await this.bytes()).toBase64();
  }
  async hex() {
    return (await this.bytes()).toHex();
  }

  // readonly properties

  get status() {
    return this.#status;
  }
  get status_text() {
    return this.#status_text;
  }
  get url() {
    return this.#url;
  }
  get type() {
    return this.#type;
  }
  get size() {
    return this.#size;
  }

  // APIs
  toReporterContent() {
    const response_container = document.createElement("div");
    
    const status_container = document.createElement("span");
    const status_group = Math.floor( this.#status / 100 );
    const status_color = ResponseType.HTTP_STATUS_COLORS[
      status_group - 1
    ];
    status_container.style.backgroundColor = status_color;
    status_container.innerText = this.#status.toString();

    const type_container = document.createElement("span");
    type_container.innerText = xml_escape(this.#type)
    + " (" + this.#size.toString() + ")";
    
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
    return new ResponseType(response, body);
  }

  getInfo() {
    return {
      name: "Requests",
      id: "s0grequests",
      blocks: [
        {
          text: "get [URL]",
          opcode: "basic_request",
          blockType: Scratch.BlockType.REPORTER,

          arguments: {
            URL: {
              type: Scratch.ArgumentType.STRING
            },
          }
        },
        "---",
        {
          text: "get body as [TYPE] from response [RESPONSE]",
          opcode: "get_response_body",
          blockType: Scratch.BlockType.REPORTER,
          arguments: {
            TYPE: {
              menu: "ENCODINGS"
            }
          }
        },
        {
          text: "get [PROP] from response [RESPONSE]",
          opcode: "get_response_property",
          blockType: Scratch.BlockType.REPORTER,
          arguments: {
            PROP: {
              menu: "PROPERTIES"
            }
          }
        },
        {
          text: "headers of response [RESPONSE]",
          opcode: "get_response_headers",
          ...vm.dogeiscutObject.Block,
          arguments: {}
        }
      ],
      menus: {
        ENCODINGS: {
          items: [
            {text: Scratch.translate("base 64"), value: "b64"},
            {text: Scratch.translate("text"), value: "txt"},
            {text: Scratch.translate("bytes"), value: "arr"},
            {text: Scratch.translate("hex"), value: "hex"},
          ]
        },
        PROPERTIES: {
          items: [
            {text: Scratch.translate("status code"), value: "status"},
            {text: Scratch.translate("status message"), value: "status_text"},
            {text: Scratch.translate("size in bytes"), value: "size"},
            {text: Scratch.translate("url"), value:"url"},
            {text: Scratch.translate("mime type"), value: "type"},
          ]
        }
      }
    }
  }
  
  basic_request(args) {
    return this.fetch(args.URL, {
      method: args.METHOD
    });
  }

  async get_response_body({TYPE, RESPONSE}) {
    switch (TYPE) {
      case "b64":
        return await RESPONSE.base64();
      case "txt":
        return await RESPONSE.text();
      case "arr":
        return await RESPONSE.bytes();
      case "hex":
        return await RESPONSE.hex();
    }
  }
  get_response_property({PROP, RESPONSE}) {
    switch (PROP) {
      case "status":
        return RESPONSE.status;
      case "status_text":
        return RESPONSE.status_text;
      case "size":
        return RESPONSE.size;
      case "url":
        return RESPONSE.url;
      case "type":
        return RESPONSE.type;
    }
  }
  get_response_headers({RESPONSE}) {
    return vm.dogeiscutObject.Type.toObject(RESPONSE.headers);
  }
}

Scratch.extensions.register(new Requests());

function xml_escape(unsafe) {
  return unsafe.replace(/[<>&'"]/g, c => {
    switch (c) {
      case "<": return "&lt;";
      case ">": return "&gt;";
      case "'": return "&apos;";
      case "\"": return "&quot;";
    }
  })
}
})(Scratch)
