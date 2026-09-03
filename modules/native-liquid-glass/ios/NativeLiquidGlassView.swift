import UIKit
import ExpoModulesCore

public final class NativeLiquidGlassView: ExpoView {
  // Event dispatcher for React Native callbacks
  public let onTabSelect = EventDispatcher()

  // State
  private var tabs: [[String: Any]] = []
  private var selectedIndex: Int = 0
  private var isDark: Bool = false

  // UI Components
  private let shadowContainer = UIView()
  private let glassPill = UIView()
  private var blurView = UIVisualEffectView()
  private var vibrancyView = UIVisualEffectView()
  private let activeIndicator = UIView()
  private var activeBlurView = UIVisualEffectView()
  private var activeVibrancyView = UIVisualEffectView()
  private let specularSheen = UIView()
  private var tabButtons: [UIButton] = []
  private var tabLabels: [UILabel] = []
  private var tabIcons: [UIImageView] = []
  private var badgeViews: [UIView] = []

  // Haptics
  private let feedbackGenerator = UIImpactFeedbackGenerator(style: .medium)

  public required init(appContext: AppContext? = nil) {
    super.init(appContext: appContext)
    setupViews()
  }

  required init?(coder: NSCoder) {
    fatalError("init(coder:) has not been implemented")
  }

  private func setupViews() {
    backgroundColor = .clear

    // 1. Shadow Container (prevents masksToBounds from clipping the ambient shadow)
    shadowContainer.backgroundColor = .clear
    shadowContainer.layer.shadowColor = UIColor.black.cgColor
    shadowContainer.layer.shadowOffset = CGSize(width: 0, height: 10)
    shadowContainer.layer.shadowOpacity = 0.4
    shadowContainer.layer.shadowRadius = 22
    addSubview(shadowContainer)

    // 2. Glass Pill Container
    glassPill.layer.cornerCurve = .continuous
    glassPill.layer.cornerRadius = 34
    glassPill.layer.masksToBounds = true
    glassPill.layer.borderWidth = 1.2
    shadowContainer.addSubview(glassPill)

    // 3. Native UIBlurEffect & UIVibrancyEffect
    updateBlurEffect()

    // 4. Fluid Active Indicator Pill
    activeIndicator.layer.cornerCurve = .continuous
    activeIndicator.layer.cornerRadius = 22
    activeIndicator.layer.masksToBounds = true
    activeIndicator.layer.borderWidth = 1.0
    activeIndicator.layer.borderColor = UIColor.white.withAlphaComponent(0.4).cgColor

    // Inside Active Indicator: vibrancy wash
    activeBlurView.autoresizingMask = [.flexibleWidth, .flexibleHeight]
    activeIndicator.addSubview(activeBlurView)

    // Specular top glint on active pill
    specularSheen.backgroundColor = UIColor.white.withAlphaComponent(0.25)
    specularSheen.isUserInteractionEnabled = false
    activeIndicator.addSubview(specularSheen)

    glassPill.addSubview(activeIndicator)
  }

  private func updateBlurEffect() {
    let blurStyle: UIBlurEffect.Style = isDark ? .systemUltraThinMaterialDark : .systemUltraThinMaterialLight
    let blurEffect = UIBlurEffect(style: blurStyle)
    let vibrancyEffect = UIVibrancyEffect(blurEffect: blurEffect, style: .label)

    blurView.removeFromSuperview()
    blurView = UIVisualEffectView(effect: blurEffect)
    blurView.autoresizingMask = [.flexibleWidth, .flexibleHeight]
    blurView.frame = glassPill.bounds
    glassPill.insertSubview(blurView, at: 0)

    // Vibrancy container inside blur
    vibrancyView.removeFromSuperview()
    vibrancyView = UIVisualEffectView(effect: vibrancyEffect)
    vibrancyView.autoresizingMask = [.flexibleWidth, .flexibleHeight]
    vibrancyView.frame = glassPill.bounds
    blurView.contentView.addSubview(vibrancyView)

    // Active pill blur
    let activeBlur = UIBlurEffect(style: isDark ? .systemChromeMaterialDark : .systemChromeMaterialLight)
    activeBlurView.effect = activeBlur

    glassPill.layer.borderColor = UIColor.white.withAlphaComponent(isDark ? 0.18 : 0.70).cgColor
    shadowContainer.layer.shadowOpacity = isDark ? 0.5 : 0.16
  }

  public func setTabs(_ newTabs: [[String: Any]]) {
    self.tabs = newTabs
    rebuildTabItems()
    setNeedsLayout()
  }

  public func setSelectedIndex(_ index: Int) {
    let previousIndex = self.selectedIndex
    self.selectedIndex = index

    if previousIndex != index {
      animateActiveIndicator(to: index)
      updateTabStyles()
    }
  }

  public func setIsDark(_ dark: Bool) {
    if self.isDark != dark {
      self.isDark = dark
      updateBlurEffect()
      updateTabStyles()
    }
  }

  private func rebuildTabItems() {
    tabButtons.forEach { $0.removeFromSuperview() }
    tabButtons.removeAll()
    tabLabels.removeAll()
    tabIcons.removeAll()
    badgeViews.removeAll()

    for (index, tab) in tabs.enumerated() {
      let button = UIButton(type: .custom)
      button.tag = index
      button.addTarget(self, action: #selector(handleTabTap(_:)), for: .touchUpInside)

      let iconName = tab["icon"] as? String ?? "star"
      let labelText = tab["label"] as? String ?? (tab["name"] as? String ?? "")
      let badgeCount = tab["badgeCount"] as? Int ?? 0

      let iconView = UIImageView()
      iconView.contentMode = .scaleAspectFit
      iconView.tintColor = isDark ? .white : .black
      iconView.image = sfSymbolForName(iconName)

      let label = UILabel()
      label.text = labelText
      label.font = UIFont.systemFont(ofSize: 10.5, weight: .medium)
      label.textAlignment = .center
      label.textColor = isDark ? UIColor.white.withAlphaComponent(0.65) : UIColor.black.withAlphaComponent(0.6)

      button.addSubview(iconView)
      button.addSubview(label)

      if badgeCount > 0 {
        let badge = createBadgeView(count: badgeCount)
        button.addSubview(badge)
        badgeViews.append(badge)
      } else {
        let dummyBadge = UIView()
        dummyBadge.isHidden = true
        button.addSubview(dummyBadge)
        badgeViews.append(dummyBadge)
      }

      glassPill.addSubview(button)
      tabButtons.append(button)
      tabLabels.append(label)
      tabIcons.append(iconView)
    }

    updateTabStyles()
  }

  private func sfSymbolForName(_ name: String) -> UIImage? {
    let symbolMap: [String: String] = [
      "storefront": "storefront.fill",
      "storefront-outline": "storefront",
      "heart": "heart.fill",
      "heart-outline": "heart",
      "cart": "cart.fill",
      "cart-outline": "cart",
      "person": "person.fill",
      "person-outline": "person"
    ]

    let systemName = symbolMap[name] ?? "circle.fill"
    let config = UIImage.SymbolConfiguration(pointSize: 19, weight: .semibold)
    return UIImage(systemName: systemName, withConfiguration: config)
  }

  private func createBadgeView(count: Int) -> UIView {
    let badge = UIView()
    badge.backgroundColor = UIColor(red: 1.0, green: 0.28, blue: 0.34, alpha: 1.0)
    badge.layer.cornerRadius = 8
    badge.layer.masksToBounds = true

    let label = UILabel()
    label.text = count > 99 ? "99+" : "\(count)"
    label.textColor = .white
    label.font = UIFont.systemFont(ofSize: 9, weight: .bold)
    label.textAlignment = .center
    label.sizeToFit()

    badge.addSubview(label)
    label.translatesAutoresizingMaskIntoConstraints = false
    NSLayoutConstraint.activate([
      label.centerXAnchor.constraint(equalTo: badge.centerXAnchor),
      label.centerYAnchor.constraint(equalTo: badge.centerYAnchor)
    ])
    return badge
  }

  @objc private func handleTabTap(_ sender: UIButton) {
    let index = sender.tag
    guard index < tabs.count else { return }

    feedbackGenerator.impactOccurred()
    setSelectedIndex(index)

    let routeName = tabs[index]["name"] as? String ?? ""
    onTabSelect([
      "index": index,
      "name": routeName
    ])
  }

  private func animateActiveIndicator(to index: Int) {
    guard index < tabButtons.count else { return }
    let targetButton = tabButtons[index]
    let targetFrame = targetButton.frame.insetBy(dx: 4, dy: 5)

    // True native iOS spring animation with damping & velocity
    UIView.animate(
      withDuration: 0.44,
      delay: 0,
      usingSpringWithDamping: 0.72,
      initialSpringVelocity: 0.8,
      options: [.curveEaseInOut, .allowUserInteraction]
    ) {
      self.activeIndicator.frame = targetFrame
      self.specularSheen.frame = CGRect(x: 0, y: 0, width: targetFrame.width, height: targetFrame.height * 0.45)
    }
  }

  private func updateTabStyles() {
    for (i, _) in tabButtons.enumerated() {
      let isSelected = (i == selectedIndex)
      let label = tabLabels[i]
      let icon = tabIcons[i]

      if isSelected {
        label.textColor = .white
        label.font = UIFont.systemFont(ofSize: 10.5, weight: .bold)
        icon.tintColor = .white
      } else {
        label.textColor = isDark ? UIColor.white.withAlphaComponent(0.60) : UIColor.black.withAlphaComponent(0.55)
        label.font = UIFont.systemFont(ofSize: 10.5, weight: .medium)
        icon.tintColor = isDark ? UIColor.white.withAlphaComponent(0.65) : UIColor.black.withAlphaComponent(0.55)
      }
    }
  }

  public override func layoutSubviews() {
    super.layoutSubviews()

    let pillWidth = min(bounds.width - 32, 440)
    let pillHeight: CGFloat = 64
    let pillX = (bounds.width - pillWidth) / 2
    let pillY: CGFloat = 4

    shadowContainer.frame = CGRect(x: pillX, y: pillY, width: pillWidth, height: pillHeight)
    glassPill.frame = shadowContainer.bounds

    let count = tabButtons.count
    guard count > 0 else { return }
    let tabWidth = pillWidth / CGFloat(count)

    for (i, button) in tabButtons.enumerated() {
      button.frame = CGRect(x: CGFloat(i) * tabWidth, y: 0, width: tabWidth, height: pillHeight)

      let icon = tabIcons[i]
      icon.frame = CGRect(x: (tabWidth - 24) / 2, y: 11, width: 24, height: 24)

      let label = tabLabels[i]
      label.frame = CGRect(x: 2, y: 39, width: tabWidth - 4, height: 14)

      let badge = badgeViews[i]
      if !badge.isHidden {
        badge.frame = CGRect(x: icon.frame.maxX - 4, y: icon.frame.minY - 4, width: 18, height: 16)
      }
    }

    if selectedIndex < tabButtons.count {
      let activeBtn = tabButtons[selectedIndex]
      let targetFrame = activeBtn.frame.insetBy(dx: 4, dy: 5)
      activeIndicator.frame = targetFrame
      specularSheen.frame = CGRect(x: 0, y: 0, width: targetFrame.width, height: targetFrame.height * 0.45)
    }
  }
}
