<?php

declare(strict_types=1);

use TYPOCONSULT\extensionNamePascal\Constants\GeneralConstants;
use TYPOCONSULT\extensionNamePascal\Domain\Model\objectNamePascal;

defined('TYPO3') or die('Access denied.');

$extKey = GeneralConstants::EXT_KEY;
$table = objectNamePascal::TABLE_NAME;
$labelPrefix = "LLL:EXT:$extKey/Resources/Private/Language/locallang_db.xlf:$table";

// TODO: LabelUtility

return [
    'ctrl' => [
        'title' => $labelPrefix,
        'label' => 'title',
        'tstamp' => 'tstamp',
        'crdate' => 'crdate',
        'cruser_id' => 'cruser_id',
        'delete' => 'deleted',
        'searchFields' => 'title',
        'typeicon_classes' => ['default' => $table]
    ],
    'types' => [
        '1' => [
            'showitem' => '--palette--;;general'
        ]
    ],
    'palettes' => [
        'general' => ['showitem' => 'title']
    ],
    'columns' => [
        'title' => [
            'label' => "$labelPrefix.title",
            'config' => [
                'type' => 'input',
                'size' => 40,
                'max' => 255,
                'eval' => 'trim',
                'required' => true
            ]
        ]
    ]
];
