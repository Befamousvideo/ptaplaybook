import Confirm from "./Confirm";
import { pageMetadata, thanksDescription } from "../../seo";
export const metadata = { ...pageMetadata({ title: "Thanks for your order", description: thanksDescription, path: "/advertise/thanks", type: "website" }), robots: { index: false } };
export default function Thanks() { return (<article><h1>Thank you!</h1><Confirm /></article>); }
