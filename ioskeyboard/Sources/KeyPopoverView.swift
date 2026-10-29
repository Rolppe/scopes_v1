import SwiftUI

/// Pitkän painalluksen ponnahdusvalikko vaihtoehtoisille merkeille (IOSKEYBOARD-TYYLI).
public struct KeyPopoverView: View {
    public let items: [String]
    public let selectedIndex: Int?
    public let itemWidth: CGFloat = 34
    public let popoverHeight: CGFloat = 44

    @Environment(\.colorScheme) private var colorScheme

    public init(items: [String], selectedIndex: Int?) {
        self.items = items
        self.selectedIndex = selectedIndex
    }

    private var isDark: Bool { colorScheme == .dark }

    private var popoverGradient: LinearGradient {
        isDark
            ? LinearGradient(
                colors: [Color(uiColor: UIColor(white: 0.28, alpha: 1.0)), Color(uiColor: UIColor(white: 0.22, alpha: 1.0))],
                startPoint: .top,
                endPoint: .bottom
            )
            : LinearGradient(
                colors: [Color.white, Color(uiColor: UIColor(red: 0.96, green: 0.96, blue: 0.97, alpha: 1.0))],
                startPoint: .top,
                endPoint: .bottom
            )
    }

    private var shadowColor: Color {
        isDark ? Color.black.opacity(0.6) : Color.black.opacity(0.25)
    }

    public var body: some View {
        HStack(spacing: 3) {
            ForEach(0..<items.count, id: \.self) { index in
                let char = items[index]
                let isSelected = (index == selectedIndex)

                ZStack {
                    if isSelected {
                        RoundedRectangle(cornerRadius: 6, style: .continuous)
                            .fill(Color(uiColor: UIColor.systemBlue))
                            .shadow(color: Color.black.opacity(0.15), radius: 2, x: 0, y: 1)
                    }

                    Text(char)
                        .font(.system(size: 22, weight: .regular))
                        .foregroundStyle(isSelected ? Color.white : (isDark ? Color.white : Color.black))
                }
                .frame(width: itemWidth, height: popoverHeight - 6)
            }
        }
        .padding(.horizontal, 4)
        .padding(.vertical, 3)
        .background(
            RoundedRectangle(cornerRadius: 9, style: .continuous)
                .fill(popoverGradient)
                .shadow(color: shadowColor, radius: 8, x: 0, y: 4)
        )
    }
}
