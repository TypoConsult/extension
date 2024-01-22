<?php

declare(strict_types=1);

use TYPOCONSULT\extensionNamePascal\Constants\GeneralConstants;
use TYPOCONSULT\TcFrontend\Assets\JavaScript;
use TYPOCONSULT\TcFrontend\Assets\StyleSheet;

$extKey = GeneralConstants::EXT_KEY;

return [
    new StyleSheet(sources: "EXT:$extKey/Resources/Private/StyleSheets/general.scss"),
    new JavaScript(sources: "EXT:$extKey/Resources/Private/JavaScripts/general.js"),
];
