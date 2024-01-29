<?php

use TYPO3\CMS\Core\Utility\ExtensionManagementUtility;
use TYPO3\CMS\Extbase\Utility\ExtensionUtility;
use TYPOCONSULT\extensionNamePascal\Constants\GeneralConstants;
use TYPOCONSULT\extensionNamePascal\Controller\PluginController;
use TYPOCONSULT\extensionNamePascal\Hooks\VoilaHook;
use TYPOCONSULT\TcTools\Utilities\LabelUtility;

defined('TYPO3') or die('Access denied.');

(function () {
    $labelPrefix = LabelUtility::getPath(identifier: 'db', extKey: GeneralConstants::EXT_KEY);

    ExtensionUtility::configurePlugin(
        'extensionNamePascal',
        'Plugin',
        [PluginController::class => 'show'],
        [],
        ExtensionUtility::PLUGIN_TYPE_CONTENT_ELEMENT
    );

    $pluginName = 'extensionNameClean_plugin';

    // Add plugin to wizardItems
    ExtensionManagementUtility::addPageTSConfig(
        "mod {
            wizards {
                newContentElement {
                    wizardItems {
                        plugins {
                            elements {
                                $pluginName {
                                    title = {$labelPrefix}tt_content.$pluginName.name
                                    description = {$labelPrefix}tt_content.$pluginName.description
                                    tt_content_defValues {
                                        CType = $pluginName
                                    }
                                }
                            }

                            show := addToList($pluginName)
                        }
                    }
                }
            }
        }"
    );

    // Adding various hooks
    $GLOBALS['TYPO3_CONF_VARS']['EXTCONF']['tc_sys']['addAdditionalPreview'][] = VoilaHook::class . '->addAdditionalPreview';
})();
