<?php

declare(strict_types=1);

namespace TYPOCONSULT\extensionNamePascal\Domain\Repository;

use TYPO3\CMS\Extbase\Persistence\Repository;
use TYPOCONSULT\extensionNamePascal\Domain\Model\objectNamePascal;

class objectNamePascalRepository extends Repository
{
    /**
     * @param int $uid
     *
     * @return objectNamePascal|null
     */
    public function findByUid($uid): ?objectNamePascal
    {
        $query = $this->createQuery();
        $query->getQuerySettings()->setRespectSysLanguage(false);
        $query->getQuerySettings()->setRespectStoragePage(false);

        $query->matching(
            $query->equals('uid', $uid)
        );

        $result = $query->execute()->getFirst();

        if ($result instanceof objectNamePascal) {
            return $result;
        }

        return null;
    }

    /**
     * @param int $uid
     *
     * @return objectNamePascal|null
     */
    public function findByUidRaw(int $uid): ?objectNamePascal
    {
        $query = $this->createQuery();
        $query->getQuerySettings()->setRespectSysLanguage(false);
        $query->getQuerySettings()->setRespectStoragePage(false);
        $query->getQuerySettings()->setIgnoreEnableFields(true);

        $query->matching(
            $query->equals('uid', $uid)
        );

        $result = $query->execute()->getFirst();

        if ($result instanceof objectNamePascal) {
            return $result;
        }

        return null;
    }
}
