import { SocketProvider } from "@/components/providers/SocketProvider";
import { getHumeAccessToken } from "@/utils/getHumeAccessToken";
import dynamic from "next/dynamic";

const Chat = dynamic(() => import("@/components/Chat"), {
  ssr: false,
});

export default async function Page() {
  const accessToken = await getHumeAccessToken();

  if (!accessToken) {
    throw new Error('Unable to get access token');
  }

  return (
    <div className={"grow flex flex-col"}>
      <SocketProvider autoConnect={false}>
        <Chat accessToken={accessToken} />
      </SocketProvider>
    </div>
  );
}
