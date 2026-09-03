import ExpoModulesCore

public final class NativeLiquidGlassModule: Module {
  public func definition() -> ModuleDefinition {
    Name("NativeLiquidGlass")

    View(NativeLiquidGlassView.self) {
      Prop("tabs") { (view: NativeLiquidGlassView, tabs: [[String: Any]]) in
        view.setTabs(tabs)
      }

      Prop("selectedIndex") { (view: NativeLiquidGlassView, index: Int) in
        view.setSelectedIndex(index)
      }

      Prop("isDark") { (view: NativeLiquidGlassView, isDark: Bool) in
        view.setIsDark(isDark)
      }

      Events("onTabSelect")
    }
  }
}
