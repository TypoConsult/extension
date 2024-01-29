<?php

defined('TYPO3') or die('Access denied.');

use TYPOCONSULT\extensionNamePascal\Domain\Model\Content;
use TYPOCONSULT\TcTools\Utilities\LabelUtility;

$table = Content::TABLE_NAME;
$labelPrefix = LabelUtility::getPath(identifier: 'db') . $table;

$pluginName = 'extensionNameClean_plugin';
$pluginIcon = "extensions-$pluginName";

// Inherit the look and feel of the text element so that we have header and bodytext
$GLOBALS['TCA'][$table]['types'][$pluginName] = $GLOBALS['TCA'][$table]['types']['text'];

// Add content typeicon_classes
$GLOBALS['TCA'][$table]['ctrl']['typeicon_classes'] = array_merge(
    $GLOBALS['TCA'][$table]['ctrl']['typeicon_classes'],
    [$pluginName => $pluginIcon]
);

// Tell TYPO3 about this plugin
\TYPO3\CMS\Extbase\Utility\ExtensionUtility::registerPlugin(
    'extensionNamePascal',
    'Plugin',
    "$labelPrefix.$pluginName.name",
    $pluginIcon
);
