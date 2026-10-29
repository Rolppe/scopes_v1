import Foundation
import ScopesCore

public enum MacAGYVirhe: LocalizedError {
    case eiLoydy(String)
    case komentoVirhe(Int32, String)

    public var errorDescription: String? {
        switch self {
        case .eiLoydy(let polku):
            return "Antigravity CLI (agy) ei löydy polusta \(polku)"
        case .komentoVirhe(let koodi, let viesti):
            return "AGY-virhe (\(koodi)): \(viesti)"
        }
    }
}

public final class MacAGYRunner: Sendable {
    public static let jaettu = MacAGYRunner()

    public let agyPolku: String
    public let nodePolku: String

    public init(
        oletusPolku: String = "~/.local/bin/agy",
        oletusNode: String = "/opt/homebrew/bin/node"
    ) {
        if FileManager.default.isExecutableFile(atPath: oletusPolku) {
            self.agyPolku = oletusPolku
        } else if FileManager.default.isExecutableFile(atPath: "/opt/homebrew/bin/agy") {
            self.agyPolku = "/opt/homebrew/bin/agy"
        } else if FileManager.default.isExecutableFile(atPath: "/usr/local/bin/agy") {
            self.agyPolku = "/usr/local/bin/agy"
        } else {
            self.agyPolku = oletusPolku
        }

        if FileManager.default.isExecutableFile(atPath: oletusNode) {
            self.nodePolku = oletusNode
        } else if FileManager.default.isExecutableFile(atPath: "/usr/local/bin/node") {
            self.nodePolku = "/usr/local/bin/node"
        } else {
            self.nodePolku = "node"
        }
    }

    public var onSaatavilla: Bool {
        FileManager.default.isExecutableFile(atPath: agyPolku)
    }

    public func suorita(argumentit: [String], tyohakemisto: String? = nil, ymparisto: [String: String]? = nil) async throws -> (koodi: Int32, tuloste: String) {
        guard onSaatavilla else {
            throw MacAGYVirhe.eiLoydy(agyPolku)
        }

        return try await withCheckedThrowingContinuation { continuation in
            let prosessi = Process()
            prosessi.executableURL = URL(fileURLWithPath: agyPolku)
            prosessi.arguments = argumentit

            if let tyohakemisto = tyohakemisto {
                prosessi.currentDirectoryURL = URL(fileURLWithPath: tyohakemisto)
            }

            var env = ProcessInfo.processInfo.environment
            if let lisaYmparisto = ymparisto {
                for (avain, arvo) in lisaYmparisto {
                    env[avain] = arvo
                }
            }
            prosessi.environment = env

            let putki = Pipe()
            prosessi.standardOutput = putki
            prosessi.standardError = putki

            do {
                try prosessi.run()
                prosessi.waitUntilExit()
                let data = putki.fileHandleForReading.readDataToEndOfFile()
                let tulos = String(data: data, encoding: .utf8) ?? ""
                continuation.resume(returning: (prosessi.terminationStatus, tulos))
            } catch {
                continuation.resume(throwing: error)
            }
        }
    }

    public func suoritaStream(argumentit: [String], tyohakemisto: String? = nil) -> AsyncThrowingStream<String, Error> {
        AsyncThrowingStream { continuation in
            guard onSaatavilla else {
                continuation.finish(throwing: MacAGYVirhe.eiLoydy(agyPolku))
                return
            }

            let prosessi = Process()
            prosessi.executableURL = URL(fileURLWithPath: agyPolku)
            prosessi.arguments = argumentit

            if let tyohakemisto = tyohakemisto {
                prosessi.currentDirectoryURL = URL(fileURLWithPath: tyohakemisto)
            }

            prosessi.environment = ProcessInfo.processInfo.environment

            let putki = Pipe()
            prosessi.standardOutput = putki
            prosessi.standardError = putki

            putki.fileHandleForReading.readabilityHandler = { handle in
                let data = handle.availableData
                guard !data.isEmpty else { return }
                if let pala = String(data: data, encoding: .utf8) {
                    continuation.yield(pala)
                }
            }

            prosessi.terminationHandler = { p in
                putki.fileHandleForReading.readabilityHandler = nil
                let jaljella = putki.fileHandleForReading.readDataToEndOfFile()
                if !jaljella.isEmpty, let pala = String(data: jaljella, encoding: .utf8) {
                    continuation.yield(pala)
                }
                if p.terminationStatus == 0 {
                    continuation.finish()
                } else {
                    continuation.finish(throwing: MacAGYVirhe.komentoVirhe(p.terminationStatus, "AGY-prosessi päättyi koodilla \(p.terminationStatus)"))
                }
            }

            do {
                try prosessi.run()
            } catch {
                continuation.finish(throwing: error)
            }

            continuation.onTermination = { _ in
                if prosessi.isRunning {
                    prosessi.terminate()
                }
            }
        }
    }

    // MAC_PROJ-juuri kuten skripteissä; Finderistä käynnistetty sovellus ei peri sitä, joten oletus ~/Projects.
    public static var oletusProjektiJuuri: String {
        (ProcessInfo.processInfo.environment["MAC_PROJ"] ?? NSHomeDirectory() + "/Projects") + "/claude/sessions-repo"
    }

    public func luoPurkutiedosto(skooppi: String, projektiJuuri: String = MacAGYRunner.oletusProjektiJuuri) async throws -> String {
        let scripti = "\(projektiJuuri)/claude/siirto/tools/pura-malliton.mjs"

        return try await withCheckedThrowingContinuation { continuation in
            let prosessi = Process()
            prosessi.executableURL = URL(fileURLWithPath: nodePolku)
            prosessi.arguments = [scripti, skooppi, "--kohde", "neutraali"]
            prosessi.currentDirectoryURL = URL(fileURLWithPath: projektiJuuri)

            let putki = Pipe()
            prosessi.standardOutput = putki
            prosessi.standardError = putki

            do {
                try prosessi.run()
                prosessi.waitUntilExit()
                let slug = skooppi.trimmingCharacters(in: .whitespacesAndNewlines).replacingOccurrences(of: " ", with: "-")
                let mdPolku = "\(NSHomeDirectory())/.local/state/pura/\(slug).md"
                if FileManager.default.fileExists(atPath: mdPolku) {
                    continuation.resume(returning: mdPolku)
                } else {
                    let errData = putki.fileHandleForReading.readDataToEndOfFile()
                    let errStr = String(data: errData, encoding: .utf8) ?? ""
                    continuation.resume(throwing: MacAGYVirhe.komentoVirhe(prosessi.terminationStatus, "Purkutiedostoa ei syntynyt: \(errStr)"))
                }
            } catch {
                continuation.resume(throwing: error)
            }
        }
    }

    public func haeMallit() async throws -> [AGYMalliVaihtoehto] {
        let (koodi, tuloste) = try await suorita(argumentit: ["models"])
        guard koodi == 0 else {
            throw MacAGYVirhe.komentoVirhe(koodi, tuloste)
        }
        return parsiiMallit(tuloste)
    }

    public func parsiiMallit(_ teksti: String) -> [AGYMalliVaihtoehto] {
        var mallit: [AGYMalliVaihtoehto] = []
        let rivit = teksti.components(separatedBy: .newlines)
        let tunnusRegex = try? NSRegularExpression(pattern: "^[a-z0-9][a-z0-9.-]*$")

        for rivi in rivit {
            if rivi.contains("Fetching available models") || rivi.trimmingCharacters(in: .whitespaces).isEmpty {
                continue
            }
            let osat = rivi.split(separator: "\t", maxSplits: 1).map(String.init)
            if osat.count == 2 {
                let id = osat[0].trimmingCharacters(in: .whitespaces)
                let nimi = osat[1].trimmingCharacters(in: .whitespaces)
                let range = NSRange(location: 0, length: id.utf16.count)
                if tunnusRegex?.firstMatch(in: id, options: [], range: range) != nil && !nimi.isEmpty {
                    mallit.append(AGYMalliVaihtoehto(id: id, nimi: nimi))
                }
            } else {
                let valit = rivi.components(separatedBy: "  ").filter { !$0.trimmingCharacters(in: .whitespaces).isEmpty }
                if valit.count >= 2 {
                    let id = valit[0].trimmingCharacters(in: .whitespaces)
                    let nimi = valit.dropFirst().joined(separator: " ").trimmingCharacters(in: .whitespaces)
                    let range = NSRange(location: 0, length: id.utf16.count)
                    if tunnusRegex?.firstMatch(in: id, options: [], range: range) != nil && !nimi.isEmpty {
                        mallit.append(AGYMalliVaihtoehto(id: id, nimi: nimi))
                    }
                }
            }
        }
        return mallit.isEmpty ? AGYMalliVaihtoehto.vakiot : mallit
    }
}
