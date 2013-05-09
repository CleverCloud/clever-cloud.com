--------------------------------------------------------------------------------
{-# LANGUAGE OverloadedStrings #-}
import           Control.Applicative ((<$>))
import           Control.Monad       (forM_)
import           Data.Monoid         (mappend, mempty)
import           Data.Maybe          (catMaybes, fromMaybe, listToMaybe, maybeToList)
import qualified Data.Map            as M

import           Utils
import           RouteFactories

import           Hakyll

import           Hakyll.Core.Metadata


--------------------------------------------------------------------------------
main :: IO ()
main = hakyll $ do

--------------------------------------------------------------------------------
-- Assets
    match "assets/img/**" $ do
        route   idRoute
        compile copyFileCompiler

    match "assets/fonts/**" $ do
        route   idRoute
        compile copyFileCompiler


    d <- makePatternDependency "assets/css/**"
    rulesExtraDependencies [d] . match "assets/css/all.less" $ do
       route   $ setExtension "css"
       compile $ getResourceString >>=
          withItemBody (unixFilter "lessc" ["-","--yui-compress","-O2"])
           


--------------------------------------------------------------------------------
-- JS
--
    match "/assets/js/*" $ do
        route   idRoute
        compile copyFileCompiler

--------------------------------------------------------------------------------
-- Reusable blocks
--

    forM_ langs $ \lang ->
        match (fromGlob $ lang ++ "/blocks/*.md") $ do
        compile $ pandocCompiler

    forM_ langs $ \lang ->
        match (fromGlob $ lang ++ "/blocks/*.html") $ do
        compile $ getResourceBody

--------------------------------------------------------------------------------
-- Simple pages
--
    forM_ langs makeSinglePages


--------------------------------------------------------------------------------
-- Index
--
    forM_ langs $ \lang ->
        match (fromGlob $ lang ++ "/index.html") $ do
            route langRoute
            compile $ getResourceBody
                >>= loadAndApplyTemplate "templates/index.html" (globalContext lang)
                >>= loadAndApplyTemplate "templates/default.html" (globalContext lang)
                >>= relativizeUrls

--------------------------------------------------------------------------------
-- Compile all templates
--
    match "templates/**" $ compile templateCompiler

--------------------------------------------------------------------------------
