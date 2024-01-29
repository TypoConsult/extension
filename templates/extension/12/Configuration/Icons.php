<?php

declare(strict_types=1);

use TYPOCONSULT\extensionNamePascal\Constants\GeneralConstants;
use TYPOCONSULT\TcTools\Services\IconLoaderService;

$iconLoaderService = new IconLoaderService(GeneralConstants::EXT_KEY);

return $iconLoaderService->readIconsFromFolder()->getIconsForIconsFile();
