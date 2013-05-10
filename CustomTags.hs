{-# LANGUAGE OverloadedStrings #-}
module CustomTags where

import Hakyll
import Utils

getWithTag :: String
           -> String
           -> [Item a]
           -> Compiler [Item a]
getWithTag fieldName tag items =
    filterItems (hasTag fieldName tag) items

getTagsFromField :: String
                 -> Identifier
                 -> Compiler [String]
getTagsFromField fieldName itemId =
    fmap (maybe [] getValues) (getMetadataField itemId fieldName)
  where
    getValues = map trim . splitOn (==',')

hasTag :: String
       -> String
       -> Item a
       -> Compiler Bool
hasTag fieldName tag id = do
    tags <- getTagsFromField fieldName (itemIdentifier id)
    return $ tag `elem` tags
