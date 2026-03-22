/**
 * A simple HTTP extension for PenguinMod.
 * @license lgpl-v3-only
 * @author Steve0Greatness
 * @version 0.0
 */
(function(Scratch){

const self_id = "s0gRequests";
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
  arrayBuffer() {
    return this.#body.arrayBuffer();
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

class RequestType {
  /**
   * @type {Map<string, string>}
   */
  headers = new Map();
  /**
   * @type {URL}
   */
  url;
  /**
   * @type {string}
   */
  #type = "application/octet-stream";

  /**
   * @type {null|string|ArrayBuffer}
   */
  #body = null;

  /**
   * @param {string} url
   */
  constructor(url) {
    this.url = new URL(url);
  }
  
  get type() {
    return this.#type;
  }
  set type(type) {
    this.#type = type;
    this.headers.set("Content-Type", type);
  }

  set_header(header, value) {
    if (typeof header !== "string" || typeof value !== "string")
      throw new Error("Invalid header details: both request headers and their contents must be plaintext.");
    this.headers.set(header, value)
  }

  get status() {
    return 0;
  }
  get status_text() {
    return "UNSENT";
  }

  async send() {
    Object.fromEntries(header.entries())
  }

  set_body(body) {
    if (typeof body === "string" || body instanceof ArrayBuffer) {
      this.#body = body;
      return;
    }
    this.#body = body?.toArrayBuffer?.() || JSON.stringify(body?.toJSON?.());
  }

  // Body getters; these are made to work identically to the
  // ones under ResponseType.
  bytes() {
    return new Promise((res, rej) => {
      if (this.#body == null) return res(new Uint8Array());
    
      if (this.#body instanceof ArrayBuffer)
        return res(new Uint8Array(this.#body));
      
      res(TextEncoding.encode(this.#body));
    });
  }
  text() {
    return new Promise((res, rej) => {
      if (this.#body == null) return res("");
      if (typeof this.#body === "string")
        return res(this.#body);
      if (this.#body instanceof ArrayBuffer)
        return res(TextEncoding.decode(new Uint8Array(this.#body)));
      res("FAIL")
    });
  }
  arrayBuffer() {
    return new Promise((res, rej) => {
      if (this.#body == null) return res(new ArrayBuffer());

      if (this.#body instanceof ArrayBuffer)
        return res(this.#body);
      res(TextEncoding.encode(this.#body).buffer)
    });
  }
  async base64() {
    return (await this.bytes()).toBase64();
  }
  async hex() {
    return (await this.bytes()).toHex();
  }
  
  // APIs
  toReporterContent() {
    const container = document.createElement("div");
    container.append("prebuilt request to ", this.url);
    return container;
  }
}

class Requests {
  constructor() {
    vm.runtime.registerCompiledExtensionBlocks(self_id, this.getCompileInfo());
  }

  async fetch(url, options) {
    const response = await Scratch.fetch(url, options);
    const body = await response.blob();
    return new ResponseType(response, body);
  }

  getInfo() {
    return {
      name: "Requests",
      id: self_id,
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
          text: "get body as [TYPE] from [RESPONSE]",
          opcode: "get_response_body",
          blockType: Scratch.BlockType.REPORTER,
          arguments: {
            TYPE: {
              menu: "ENCODINGS"
            }
          }
        },
        {
          text: "get [PROP] from [RESPONSE]",
          opcode: "get_response_property",
          blockType: Scratch.BlockType.REPORTER,
          arguments: {
            PROP: {
              menu: "PROPERTIES"
            }
          }
        },
        {
          text: "headers of [RESPONSE]",
          opcode: "get_response_headers",
          ...(
            vm?.dogeiscutObject?.Block
            ?? {
              blockType: Scratch.BlockType.REPORTER,
              blockShape: Scratch.BlockShape.PLUS
            }
          ),
          arguments: {}
        },
        "---",
        {
          opcode: "current_request",
          text: "current request",
          blockType: Scratch.BlockType.REPORTER,
          hideFromPalette: true,
          canDragDuplicate: true,
        },
        {
          opcode: "request_builder",
          text: "build request to [URL] [CURRENT]",
          blockType: Scratch.BlockType.REPORTER,
          branches: [{}],
          arguments: {
            URL: {
              type: Scratch.ArgumentType.STRING
            },
            CURRENT: {
              fillIn: "current_request"
            }
          }
        },
        {
          opcode: "builder_set_current_body",
          text: "set current request body to [BODY]",
          blockType: Scratch.BlockType.COMMAND,
          arguments: {
            BODY: {
              type: Scratch.ArgumentType.STRING,
              exemptFromNormalization: true,
            }
          }
        },
        {
          opcode: "builder_set_current_header",
          text: "set header [HEADER] to [VALUE] in current request",
          blockType: Scratch.BlockType.COMMAND,
          arguments: {
            HEADER: {
              type: Scratch.ArgumentType.STRING,
            },
            VALUE: {
              type: Scratch.ArgumentType.STRING,
            }
          }
        }
      ],
      menus: {
        ENCODINGS: {
          items: [
            ...(!!vm.agBuffer ? [ { text: Scratch.translate("buffer"), value:"buf" } ] : []),
            {text: Scratch.translate("text"), value: "txt"},
            {text: Scratch.translate("object"), value: "obj"},
            {text: Scratch.translate("array"), value: "arr"},
            {text: Scratch.translate("base 64"), value: "b64"},
            {text: Scratch.translate("bytes"), value: "byt"},
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
        },
        REQUEST_PROPS: {
          items: [
            {text: Scratch.translate("url"), value:"url"},
            {text: Scratch.translate("mime type"), value: "type"},
          ]
        }
      }
    }
  }

  getCompileInfo() {
    return {
      ir: {
        request_builder: (generator, block) => {
          generator.script.yields = true;
          return {
            kind: "input",
            substack: generator.descendSubstack(block, "SUBSTACK"),
            url: generator.descendInputOfBlock(block, "URL"),
          };
        },
        builder_set_current_body: (generator, block) => (
          {
            kind: "stack",
            body: generator.descendInputOfBlock(block, "BODY"),
          }
        ),
        current_request: () => (
          {
            kind: "input",
          }
        ),
        get_response_property: (generator, block) => (
          {
            kind: "input",
            prop: block.fields.PROP.value,
            object: generator.descendInputOfBlock(block, "RESPONSE"),
          }
        ),
        get_response_headers: (generator, block) => (
          {
            kind: "input",
            object: generator.descendInputOfBlock(block, "RESPONSE"),
          }
        ),
      },
      js: {
        request_builder: (node, compiler, imports) => {
          const copy_source  = compiler.source;
          const url = "(" + compiler.descendInput(node.url).asString() + ")";
          compiler.source    = "(yield* (function*(__s0gRequests_current_builder_object__) {";
          compiler.descendStack(node.substack, new imports.Frame(false, "s0gRequests", true));
          compiler.source   += "return __s0gRequests_current_builder_object__;"
          compiler.source   += `})(new vm.s0gRequests.RequestType(${url})))`;
          const stack_source = compiler.source;
          compiler.source = copy_source;
          return new imports.TypedInput(stack_source, imports.TYPE_UNKNOWN);
        },
        current_request: (node, compiler, imports) => {
          if (!compiler.currentFrame?.importantData?.parents?.includes?.("s0gRequests"))
            return new imports.TypedInput("(null)", imports.TYPE_UNKNOWN);
          return new imports.TypedInput("(__s0gRequests_current_builder_object__)", imports.TYPE_UNKNOWN)
        },
        builder_set_current_body: (node, compiler, imports) => {
          if (!compiler.currentFrame?.importantData?.parents?.includes?.("s0gRequests"))
            return;
          compiler.source += "__s0gRequests_current_builder_object__.set_body(";
          compiler.source += compiler.descendInput(node.body).asUnknown();
          compiler.source += ");\n";
        },
        get_response_property: (node, compiler, imports) => {
          const object = "(" + compiler.descendInput(node.object).asUnknown() + ")";
          switch (node.prop) {
            case "status":
              return new imports.TypedInput(`${object}.status`, imports.TYPE_NUMBER);
            case "status_text":
              return new imports.TypedInput(`${object}.status_text`, imports.TYPE_STRING);
            case "size":
              return new imports.TypedInput(`${object}.size`, imports.TYPE_NUMBER);
            case "url":
              return new imports.TypedInput(`${object}.url`, imports.TYPE_STRING);
            case "type":
              return new imports.TypedInput(`${object}.type`, imports.TYPE_STRING);
            default:
              return new imports.TypedInput("null", imports.TYPE_UNKNOWN);
          }
        },
        get_response_headers: (node, compiler, imports) => {
          const object = compiler.descendInput(node.object).asUnknown();
          return new imports.TypedInput(
            `(vm.dogeiscutObject.Type.toObject((${object}).headers))`,
            imports.TYPE_UNKNOWN
          )
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
      case "byt":
        return new vm.jwArray.Type([...(await RESPONSE.bytes())]);
      case "hex":
        return await RESPONSE.hex();
      case "buf":
        return new vm.agBuffer.Type(await RESPONSE.arrayBuffer());
      case "obj":
        return vm.dogeiscutObject.Type.toObject(JSON.parse(await RESPONSE.text()));
      case "arr":
        return new vm.jwArray.Type(JSON.parse(await RESPONSE.text()));
      default:
        return null;
    }
  }
}

const dependencies = [
  "jwArray",
  "dogeiscutObject",
  "agBuffer", // OPTIONAL
];

vm.on("EXTENSION_ADDED", info => {
  const is_dependency = dependencies.includes(info.id);
  if (!is_dependency) return;
  try {
    vm.extensionManager.refreshBlocks(self_id);
  } catch (_) {}
  // if we fail here, that means the extension hasn't loaded yet,
  // so refreshing it is pointless.
});

if (!vm.jwArray)
  vm.extensionManager.loadExtensionURL("jwArray");

if (!vm.dogeiscutObject)
  vm.extensionManager.loadExtensionURL(
    "https://extensions.penguinmod.com/extensions/DogeisCut/dogeiscutObject.js"
  );

vm.s0gRequests = {
  RequestType,
  ResponseType,
};

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
