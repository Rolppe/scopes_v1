import UIKit
import SwiftUI

public class KeyboardViewController: UIInputViewController, UIInputViewAudioFeedback {
    public var enableInputClicksWhenVisible: Bool {
        return true
    }

    public let state = KeyboardViewState()
    public private(set) var heightConstraint: NSLayoutConstraint?
    private var hostingController: UIHostingController<KeyboardRootView>?
    private let hapticGenerator = UIImpactFeedbackGenerator(style: .light)

    public var isLandscape: Bool {
        if traitCollection.verticalSizeClass == .compact {
            return true
        } else if traitCollection.verticalSizeClass == .regular && traitCollection.userInterfaceIdiom != .pad {
            return false
        }
        let screen = currentScreenBounds
        return screen.width > screen.height
    }

    private var currentScreenBounds: CGRect {
        if let window = view.window {
            return window.screen.bounds
        }
        return UIScreen.main.bounds
    }

    public override func viewDidLoad() {
        super.viewDidLoad()

        KeyboardFeedback.shared.prepare()

        state.isLandscape = isLandscape
        let rootView = KeyboardRootView(controller: self, state: state)
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

    public override func viewDidAppear(_ animated: Bool) {
        super.viewDidAppear(animated)
        updateKeyboardHeight()
    }

    public override func traitCollectionDidChange(_ previousTraitCollection: UITraitCollection?) {
        super.traitCollectionDidChange(previousTraitCollection)
        if previousTraitCollection?.verticalSizeClass != traitCollection.verticalSizeClass {
            updateKeyboardHeight()
        }
    }

    public override func viewWillTransition(to size: CGSize, with coordinator: UIViewControllerTransitionCoordinator) {
        super.viewWillTransition(to: size, with: coordinator)

        let screen = currentScreenBounds
        let shortSide = min(screen.width, screen.height)
        let isTargetLandscape = size.width > (shortSide + 50)

        updateKeyboardHeight(isLandscape: isTargetLandscape)

        coordinator.animate(alongsideTransition: { [weak self] _ in
            guard let self = self else { return }
            self.updateKeyboardHeight(isLandscape: isTargetLandscape)
            self.view.layoutIfNeeded()
        }, completion: { [weak self] _ in
            guard let self = self else { return }
            self.updateKeyboardHeight()
            self.view.layoutIfNeeded()
        })
    }

    public override func viewDidLayoutSubviews() {
        super.viewDidLayoutSubviews()
        updateInsets()
    }

    public override func viewSafeAreaInsetsDidChange() {
        super.viewSafeAreaInsetsDidChange()
        updateInsets()
    }

    private func updateInsets() {
        let insets = view.safeAreaInsets
        state.safeAreaInsets = EdgeInsets(top: insets.top, leading: insets.left, bottom: insets.bottom, trailing: insets.right)
    }

    public func updateKeyboardHeight(isLandscape: Bool? = nil) {
        let landscape = isLandscape ?? self.isLandscape
        state.isLandscape = landscape
        updateInsets()
        let targetHeight: CGFloat = landscape ? 175.0 : 255.0

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
        KeyboardFeedback.shared.trigger(.standard)
    }

    public func playHaptic() {
        KeyboardFeedback.shared.trigger(.standard)
    }
}
