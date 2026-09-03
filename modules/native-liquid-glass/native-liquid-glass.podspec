Pod::Spec.new do |s|
  s.name           = 'native-liquid-glass'
  s.version        = '1.0.0'
  s.summary        = 'Native iOS Liquid Glass Navigation Bar with UIBlurEffect, UIVibrancyEffect, and fluid spring animations'
  s.author         = 'SuperMarketApp'
  s.homepage       = 'https://github.com/jkazakos/SuperMarketApp'
  s.platform       = :ios, '15.1'
  s.source         = { :git => '' }
  s.source_files   = 'ios/**/*.{h,m,mm,swift}'
  s.dependency 'ExpoModulesCore'
  s.swift_version  = '5.0'
end
