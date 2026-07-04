import Foundation

enum StepsWidgetBackendClient {
    private static let requestTimeout: TimeInterval = 15

    static func fetchTodayHealth(
        completion: @escaping (StepsWidgetHealthMetrics?) -> Void
    ) {
        guard let credentials = StepsWidgetCredentialsStore.load(),
              credentials.isValid,
              let url = healthTodayURL(credentials: credentials) else {
            completion(nil)
            return
        }

        var request = URLRequest(url: url)
        request.httpMethod = "GET"
        request.timeoutInterval = requestTimeout
        request.cachePolicy = .reloadIgnoringLocalCacheData
        request.setValue("Bearer \(credentials.authToken)", forHTTPHeaderField: "Authorization")
        request.setValue("application/json", forHTTPHeaderField: "Accept")

        URLSession.shared.dataTask(with: request) { data, response, _ in
            guard let data,
                  let httpResponse = response as? HTTPURLResponse,
                  httpResponse.statusCode == 200,
                  let metrics = parseHealthResponse(data) else {
                if let httpResponse = response as? HTTPURLResponse,
                   httpResponse.statusCode == 401 {
                    StepsWidgetCredentialsStore.clear()
                }
                completion(nil)
                return
            }

            completion(metrics)
        }.resume()
    }

    private static func healthTodayURL(credentials: StepsWidgetCredentials) -> URL? {
        var base = credentials.apiBaseUrl.trimmingCharacters(in: .whitespacesAndNewlines)
        if base.hasSuffix("/") {
            base.removeLast()
        }

        var components = URLComponents(string: "\(base)/health/google/today")
        components?.queryItems = [
            URLQueryItem(name: "userId", value: credentials.userId),
        ]
        return components?.url
    }

    private static func parseHealthResponse(_ data: Data) -> StepsWidgetHealthMetrics? {
        guard let json = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
              json["status"] as? String == "ok" else {
            return nil
        }

        let steps = intValue(json["steps"]) ?? 0
        let burnedCalories = intValue(json["activeCaloriesKcal"]) ?? 0
        let distance = doubleValue(json["distance"]) ?? 0
        let flightsClimbed = intValue(json["flightsClimbed"]) ?? 0

        return StepsWidgetHealthMetrics(
            steps: steps,
            burnedCalories: burnedCalories,
            distance: distance,
            flightsClimbed: flightsClimbed
        )
    }

    private static func intValue(_ value: Any?) -> Int? {
        switch value {
        case let intValue as Int:
            return intValue
        case let doubleValue as Double:
            return Int(doubleValue.rounded())
        case let number as NSNumber:
            return number.intValue
        case let string as String:
            return Int(string)
        default:
            return nil
        }
    }

    private static func doubleValue(_ value: Any?) -> Double? {
        switch value {
        case let doubleValue as Double:
            return doubleValue
        case let intValue as Int:
            return Double(intValue)
        case let number as NSNumber:
            return number.doubleValue
        case let string as String:
            return Double(string)
        default:
            return nil
        }
    }
}
