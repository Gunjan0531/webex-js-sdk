/* eslint-disable @typescript-eslint/no-misused-new */
/* eslint-disable valid-jsdoc */
/* eslint-disable require-jsdoc */
import {
  AudioDeviceConstraints,
  createCameraStream as wcmeCreateCameraStream,
  createDisplayStream as wcmeCreateDisplayStream,
  createDisplayStreamWithAudio as wcmeCreateDisplayStreamWithAudio,
  createMicrophoneStream as wcmeCreateMicrophoneStream,
  LocalDisplayStream,
  LocalSystemAudioStream,
  LocalMicrophoneStream as WcmeLocalMicrophoneStream,
  LocalCameraStream as WcmeLocalCameraStream,
  VideoDeviceConstraints,
} from '@webex/internal-media-core';
import {TypedEvent} from '@webex/ts-events';

export {
  getDevices,
  LocalStream,
  LocalDisplayStream,
  LocalSystemAudioStream,
  LocalStreamEventNames,
  StreamEventNames,
  RemoteStream,
} from '@webex/internal-media-core';

export type ServerMuteReason =
  | 'remotelyMuted' // other user has remotely muted us
  | 'clientRequestFailed' // client called setMuted() but server request failed
  | 'localUnmuteRequired'; // server forced the client to be unmuted

// these events are in addition to WCME events. This will be properly typed once webrtc-core event types inheritance is fixed
export enum LocalMicrophoneStreamEventNames {
  ServerMuted = 'muted:byServer',
}

// these events are in addition to WCME events. This will be properly typed once webrtc-core event types inheritance is fixed
export enum LocalCameraStreamEventNames {
  ServerMuted = 'muted:byServer',
}

export class LocalMicrophoneStream extends WcmeLocalMicrophoneStream {
  private unmuteAllowed = true;

  [LocalMicrophoneStreamEventNames.ServerMuted] = new TypedEvent<
    (muted: boolean, reason: ServerMuteReason) => void
  >();

  /**
   * @internal
   */
  setUnmuteAllowed(allowed) {
    this.unmuteAllowed = allowed;
  }

  /**
   * @returns true if user is allowed to unmute the Stream, false otherwise
   */
  isUnmuteAllowed() {
    return this.unmuteAllowed;
  }

  setMuted(muted: boolean): void {
    if (!muted) {
      if (!this.isUnmuteAllowed()) {
        throw new Error('Unmute is not allowed');
      }
    }

    return super.setMuted(muted);
  }

  /**
   * @internal
   */
  setServerMuted(muted: boolean, reason: ServerMuteReason) {
    if (muted !== this.muted) {
      this.setMuted(muted);
      this[LocalMicrophoneStreamEventNames.ServerMuted].emit(muted, reason);
    }
  }
}

export class LocalCameraStream extends WcmeLocalCameraStream {
  private unmuteAllowed = true;

  [LocalCameraStreamEventNames.ServerMuted] = new TypedEvent<
    (muted: boolean, reason: ServerMuteReason) => void
  >();

  /**
   * @internal
   */
  setUnmuteAllowed(allowed) {
    this.unmuteAllowed = allowed;
  }

  /**
   * @returns true if user is allowed to unmute the Stream, false otherwise
   */
  isUnmuteAllowed() {
    return this.unmuteAllowed;
  }

  setMuted(muted: boolean): void {
    if (!muted) {
      if (!this.isUnmuteAllowed()) {
        throw new Error('Unmute is not allowed');
      }
    }

    return super.setMuted(muted);
  }

  /**
   * @internal
   */
  setServerMuted(muted: boolean, reason: ServerMuteReason) {
    if (muted !== this.muted) {
      this.setMuted(muted);
      this[LocalCameraStreamEventNames.ServerMuted].emit(muted, reason);
    }
  }
}

export const createMicrophoneStream = (constraints?: AudioDeviceConstraints) =>
  wcmeCreateMicrophoneStream(LocalMicrophoneStream, constraints);

export const createCameraStream = (constraints?: VideoDeviceConstraints) =>
  wcmeCreateCameraStream(LocalCameraStream, constraints);

export const createDisplayStream = () => wcmeCreateDisplayStream(LocalDisplayStream);

export const createDisplayStreamWithAudio = () =>
  wcmeCreateDisplayStreamWithAudio(LocalDisplayStream, LocalSystemAudioStream);
