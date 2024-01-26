<?php

declare(strict_types=1);

use TYPOCONSULT\extensionNamePascal\Constants\GeneralConstants;
use TYPOCONSULT\TcTools\Services\IconLoaderService;

return (new IconLoaderService(GeneralConstants::EXT_KEY))->readIconsFromFolder()->getIconsForIconsFile();
