import Libp2p from 'libp2p';
import WebSockets from 'libp2p-websockets';
import WebRtcStar from 'libp2p-webrtc-star';
import { NOISE } from 'libp2p-noise';
import Mplex from 'libp2p-mplex';
import wrtc from 'wrtc';

const WEBRTC_STAR = process.env.WEBRTC_STAR || '';

export default ({ peerId }) => {
  const transportKey = WebRtcStar.prototype[Symbol.toStringTag];
  return Libp2p.create({
    modules: {
      transport: [WebSockets, WebRtcStar],
      connEncryption: [NOISE],
      streamMuxer: [Mplex]
    },
    addresses: {
      listen: [WEBRTC_STAR]
    },
    config: {
      transport: {
        [transportKey]: {
          wrtc
        }
      }
    },
    peerId
  });
};
