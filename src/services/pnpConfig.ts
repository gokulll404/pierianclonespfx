// services/pnpConfig.ts
import { spfi } from "@pnp/sp";
import { SPFx } from "@pnp/sp";
import "@pnp/sp/webs";
import "@pnp/sp/search";
import { WebPartContext } from "@microsoft/sp-webpart-base";

let _sp: ReturnType<typeof spfi>;

export const getSP = () => _sp;

export const setupSP = (context: WebPartContext) => {
  _sp = spfi().using(SPFx(context));
};
