import { WebPartContext } from "@microsoft/sp-webpart-base";
import { SPFI } from "@pnp/sp";

export interface IAppProps {
  sp:SPFI;
  context:WebPartContext;
}