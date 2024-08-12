import getSubstreamsData from "~~/utils/scaffold-eth/getSubstreamsData";

const MapPools = async () => {
  const substreamsData = await getSubstreamsData();
  console.log(substreamsData);
  return (
    <>
      <div>data goes here: {substreamsData}</div>
      <div>sup</div>
    </>
  );
};
export default MapPools;
