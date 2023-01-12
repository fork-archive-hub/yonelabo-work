import React, { useEffect, useState } from 'react'
import Peer from 'skyway-js'

export default function Home() {
  let localStream: MediaStream;
  const [callFlag , setCallFlag] = useState(false);
  const peer = new Peer({
    key: "b160e98d-c322-4a0a-83df-b5c4e86c8891",
    // key: process.env.SKYWAY_KEY,
    debug: 3
  });
  peer.on('open', () => {
    document.getElementById('my-id')!.textContent = peer.id;
  });
  peer.on('call', mediaConnection => {
    mediaConnection.answer(localStream);
    setEventListener(mediaConnection);
  });
  const theirCall = () => {
    if(!document) return
      const theirID = document.getElementById('their-id');
      // console.log("ehiohfwb87129871973971209372109e", theirID)
      const Id = theirID as any
      console.log(Id)
      const mediaConnection = peer.call(Id.value, localStream);
      setEventListener(mediaConnection);
  }
  // イベントリスナを設置する関数
  const setEventListener = (mediaConnection: any) => {
    console.log("mediaConnection", mediaConnection)
    // ここの.onメソッドが発火していない
    mediaConnection.on('stream', async (stream: any) => {
      console.log("stream", stream)
      // video要素にカメラ映像をセットして再生
      const videoElm: any = document.getElementById('their-video')
      videoElm!.srcObject = stream;
      await videoElm!.play();
    });
  }
  const makeCall = () => {
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then(async (stream:any) => {
        setCallFlag(true);
        // 成功時にvideo要素にカメラ映像をセットし、再生
        const videoElm: any = document.getElementById('my-video');
        videoElm!.srcObject = stream;
        await videoElm!.play() as HTMLElement;
        console.log("発信");
        // 着信時に相手にカメラ映像を返せるように、グローバル変数に保存しておく
        localStream = stream;
      }).catch(error => {
        // 失敗時にはエラーログを出力
        console.error('mediaDevice.getUserMedia() error:', error);
        return;
      });
  }
  useEffect(() => {
    // 発信をしたときに、ここを発火させる
    makeCall();
    console.log("useEffect")
  }, [callFlag])
  return (
    <div>
      <p>自分のID(相手にわたすID)</p>
      <p id="my-id"></p>
      <video id="my-video" width="400px" ></video>
      <input id="their-id"></input>
      <button id="make-call" onClick={() => {
        console.log('||||')
        theirCall();
      }}>発信</button>
      <p>相手の映像</p>
      <video id="their-video" width="400px"></video>
    </div>
  )
}
