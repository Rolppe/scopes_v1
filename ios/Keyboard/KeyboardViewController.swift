import UIKit
import SwiftUI

public class KeyboardViewController: UIInputViewController, UIInputViewAudioFeedback {
    public var enableInputClicksWhenVisible: Bool {
        return true
    }

    private var hostingController: UIHostingController<KeyboardRootView>?
    private var heightConstraint: NSLayoutConstraint?
    private let hapticGenerator = UIImpactFeedbackGenerator(style: .light)

    public override func viewDidLoad() {
        super.viewDidLoad()

        hapticGenerator.prepare()

        let rootView = KeyboardRootView(controller: self)
        let hosting = UIHostingController(rootView: rootView)
        self.hostingController = hosting

        addChild(hosting)
        view.addSubview(hosting.view)
        hosting.view.translatesAutoresizingMaskIntoConstraints = false

        NSLayoutConstraint.activate([
            hosting.view.leftAnchor.constraint(equalTo: view.leftAnchor),
            hosting.view.rightAnchor.constraint(equalTo: view.rightAnchor),
            hosting.view.topAnchor.constraint(equalTo: view.topAnchor),
            hosting.view.bottomAnchor.constraint(equalTo: view.bottomAnchor)
        ])

        hosting.didMove(toParent: self)
        updateKeyboardHeight()
    }

    public override func viewWillAppear(_ animated: Bool) {
        super.viewWillAppear(animated)
        updateKeyboardHeight()
    }

    public override func viewWillTransition(to size: CGSize, with coordinator: UIViewControllerTransitionCoordinator) {
        super.viewWillTransition(to: size, with: coordinator)
        coordinator.animate(alongsideTransition: { _ in
            self.updateKeyboardHeight(size: size)
        })
    }

    private func updateKeyboardHeight(size: CGSize? = nil) {
        let currentSize = size ?? view.bounds.size
        let isLandscape = currentSize.width > currentSize.height
        let targetHeight: CGFloat = isLandscape ? 175.0 : 255.0

        if let constraint = heightConstraint {
            constraint.constant = targetHeight
        } else {
            let constraint = view.heightAnchor.constraint(equalToConstant: targetHeight)
            constraint.priority = .defaultHigh
            constraint.isActive = true
            heightConstraint = constraint
        }
    }

    // MARK: - Proxy-kutsut
    public func insertText(_ text: String) {
        textDocumentProxy.insertText(text)
    }

    public func deleteBackward() {
        textDocumentProxy.deleteBackward()
    }

    public func moveCursor(offset: Int) {
        textDocumentProxy.adjustTextPosition(byCharacterOffset: offset)
    }

    public func playClick() {
        UIDevice.current.playInputClick()
    }

    public func playHaptic() {
        hapticGenerator.impactOccurred()
        hapticGenerator.prepare()
    }
}
