module Utils where

import Data.List (dropWhile, intercalate)
import Data.Maybe (catMaybes)

import Hakyll

splitOn :: (a -> Bool) -> [a] -> [[a]]
splitOn _ [] = []
splitOn f l@(x:xs)
  | f x = splitOn f xs
  | otherwise = let (h,t) = break f l in h:(splitOn f t)

replace :: (Eq a) => a -> [a] -> [a] -> [a]
replace old new = intercalate new . splitOn (==old)

filterItems :: (a -> Compiler Bool) -> [a] -> Compiler [a]
filterItems p l = do
    ct <- sequence $ map (keepItem p) l
    return $ catMaybes ct

keepItem :: (a -> Compiler Bool) -> a -> Compiler (Maybe a)
keepItem p i = do
    ok <- p i
    return $ if ok then Just i else Nothing

itemIdFromIdentifier :: Identifier -> String
itemIdFromIdentifier i = itemId
  where
    itemId = head $ splitOn (=='.') fileName
    stringId = show i
    fileName = last $ splitOn (=='/') stringId

itemIdFromItem :: Item a -> String
itemIdFromItem = itemIdFromIdentifier . itemIdentifier
