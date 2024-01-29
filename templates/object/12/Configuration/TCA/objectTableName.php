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
