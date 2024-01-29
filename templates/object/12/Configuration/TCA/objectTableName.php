<?php

declare(strict_types=1);

use TYPOCONSULT\extensionNamePascal\Domain\Model\objectNamePascal;
use TYPOCONSULT\TcTools\Utilities\LabelUtility;

defined('TYPO3') or die('Access denied.');

$table = objectNamePascal::TABLE_NAME;
$labelPrefix = LabelUtility::getPath(identifier: 'db') . $table;

return [
    'ctrl' => [
        'title' => $labelPrefix,
        'createdBy' => true,
        'crdate' => 'crdate',
        'default_sortby' => 'uid DESC',
        'delete' => 'deleted',
        'enablecolumns' => [
            'disabled' => 'disabled',
            'starttime' => 'starttime',
            'endtime' => 'endtime'
        ],
        'label' => 'title',
        'searchFields' => 'title',
        'tstamp' => 'tstamp',
        'typeicon_classes' => ['default' => $table]
    ],
    'types' => [
        0 => [
            'showitem' => '
            title,
            --div--;LLL:EXT:core/Resources/Private/Language/Form/locallang_tabs.xlf:access,disabled,--palette--;;access'
        ]
    ],
    'palettes' => [
        'access' => ['showitem' => 'starttime, endtime']
    ],
    'columns' => [
        'disabled' => [
            'label' => 'LLL:EXT:core/Resources/Private/Language/locallang_general.xlf:LGL.disabled',
            'config' => [
                'type' => 'check',
                'renderType' => 'checkboxToggle'
            ]
        ],
        'endtime' => [
            'label' => 'LLL:EXT:core/Resources/Private/Language/locallang_general.xlf:LGL.endtime',
            'config' => [
                'type' => 'datetime',
                'format' => 'date',
                'size' => 15,
                'default' => 0
            ]
        ],
        'starttime' => [
            'label' => 'LLL:EXT:core/Resources/Private/Language/locallang_general.xlf:LGL.starttime',
            'config' => [
                'type' => 'datetime',
                'format' => 'date',
                'size' => 15,
                'default' => 0
            ]
        ],
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
