// Copyright 2015-present 650 Industries. All rights reserved.

import Foundation

/**
 The `ExpoNetworkInterceptorProtocolDelegate` implementation to dispatch CDP (Chrome DevTools Protocol) events
 */
@objc
public class ExpoRequestCdpLogger : NSObject, ExpoRequestInterceptorProtocolDelegate {
  private var delegate: ExpoRequestCdpLoggerDelegate?

  override private init() {}

  @objc
  public static let shared = ExpoRequestCdpLogger()

  @objc
  public func setDelegate(_ newValue: ExpoRequestCdpLoggerDelegate?) {
    DispatchQueue.global().sync {
      self.delegate = newValue
    }
  }

  private func dispatchEvent<T: CDP.EventParms>(_ event: CDP.Event<T>) {
    DispatchQueue.global().sync {
      let encoder = JSONEncoder()
      if let jsonData = try? encoder.encode(event), let payload = String(data: jsonData, encoding: .utf8) {
        self.delegate?.dispatch(payload)
      }
    }
  }

  // MARK: ExpoNetworkInterceptorProtocolDelegate implementations

  func willSendRequest(requestId: String, request: URLRequest, redirectResponse: HTTPURLResponse?) {
    let now = Date().timeIntervalSince1970

    let params = CDP.Network.RequestWillBeSentParams(now: now, requestId: requestId, request: request, redirectResponse: redirectResponse)
    dispatchEvent(CDP.Event(method: "Network.requestWillBeSent", params: params))

    let params2 = CDP.Network.RequestWillBeSentExtraInfoParams(now: now, requestId: requestId, request: request)
    dispatchEvent(CDP.Event(method: "Network.requestWillBeSentExtraInfo", params: params2))
  }

  func didReceiveResponse(requestId: String, request: URLRequest, response: HTTPURLResponse) {
    let now = Date().timeIntervalSince1970

    let params = CDP.Network.ResponseReceivedParams(now: now, requestId: requestId, request: request, response: response)
    dispatchEvent(CDP.Event(method: "Network.responseReceived", params: params))

    let params2 = CDP.Network.LoadingFinishedParams(now: now, requestId: requestId, request: request, response: response)
    dispatchEvent(CDP.Event(method: "Network.loadingFinished", params: params2))
  }

  func didReceiveResponseBody(requestId: String, responseBody: Data, isText: Bool) {
    let now = Date().timeIntervalSince1970
    let params = CDP.Network.ExpoReceivedResponseBodyParams(now: now, requestId: requestId, responseBody: responseBody, isText: isText)
    dispatchEvent(CDP.Event(method: "Expo(Network.receivedResponseBody)", params: params))
  }
}

/**
 The delegate to dispatch CDP events for ExpoRequestCdpLogger
 */
@objc
public protocol ExpoRequestCdpLoggerDelegate {
  @objc
  func dispatch(_ event: String)
}
