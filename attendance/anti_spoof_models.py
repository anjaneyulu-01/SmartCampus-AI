# Lightweight MiniFASNet-like implementations
# These are minimal implementations intended to match common MiniFASNet V1/V2 shapes
# so state_dicts can be loaded here. They are not guaranteed identical to upstream
# but work for many releases that use standard conv blocks.

import torch
import torch.nn as nn
import torch.nn.functional as F


class SEBlock(nn.Module):
    def __init__(self, in_ch, r=8):
        super().__init__()
        self.fc1 = nn.Linear(in_ch, in_ch // r)
        self.fc2 = nn.Linear(in_ch // r, in_ch)

    def forward(self, x):
        b, c, _, _ = x.size()
        y = x.mean(dim=(2, 3))
        y = F.relu(self.fc1(y))
        y = torch.sigmoid(self.fc2(y)).view(b, c, 1, 1)
        return x * y


class ConvBNAct(nn.Module):
    def __init__(self, in_ch, out_ch, k=3, s=1, p=1, act=nn.ReLU):
        super().__init__()
        self.conv = nn.Conv2d(in_ch, out_ch, k, stride=s, padding=p, bias=False)
        self.bn = nn.BatchNorm2d(out_ch)
        self.act = act()

    def forward(self, x):
        return self.act(self.bn(self.conv(x)))


class MiniFASNetV1SE(nn.Module):
    def __init__(self, input_ch=3, num_classes=1):
        super().__init__()
        # small feature extractor
        self.stem = nn.Sequential(
            ConvBNAct(input_ch, 16),
            ConvBNAct(16, 32, s=2),
            ConvBNAct(32, 32),
        )
        self.block1 = nn.Sequential(
            ConvBNAct(32, 64, s=2),
            SEBlock(64),
        )
        self.block2 = nn.Sequential(
            ConvBNAct(64, 128, s=2),
            SEBlock(128),
        )
        self.pool = nn.AdaptiveAvgPool2d(1)
        self.fc = nn.Linear(128, num_classes)

    def forward(self, x):
        x = self.stem(x)
        x = self.block1(x)
        x = self.block2(x)
        x = self.pool(x).view(x.size(0), -1)
        out = self.fc(x)
        return out


class MiniFASNetV2(nn.Module):
    def __init__(self, input_ch=3, num_classes=1):
        super().__init__()
        # slightly different wider stem
        self.stem = nn.Sequential(
            ConvBNAct(input_ch, 24),
            ConvBNAct(24, 48, s=2),
            ConvBNAct(48, 48),
        )
        self.block1 = nn.Sequential(
            ConvBNAct(48, 96, s=2),
            SEBlock(96),
        )
        self.block2 = nn.Sequential(
            ConvBNAct(96, 192, s=2),
            SEBlock(192),
        )
        self.pool = nn.AdaptiveAvgPool2d(1)
        self.fc = nn.Linear(192, num_classes)

    def forward(self, x):
        x = self.stem(x)
        x = self.block1(x)
        x = self.block2(x)
        x = self.pool(x).view(x.size(0), -1)
        out = self.fc(x)
        return out


# convenience constructor mapping
MODEL_MAP = {
    'minifasnetv1se': MiniFASNetV1SE,
    'minifasnetv2': MiniFASNetV2,
}
