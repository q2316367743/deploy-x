import {DialogPlugin, Image} from "tdesign-vue-next";
import sz from "@/assets/image/sz.jpg";

export const openSz = () => {
  DialogPlugin({
    header: false,
    footer: false,
    placement: 'center',
    default: () => <Image src={sz} alt="赏赞码"/>,
  })
}